import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { buildStatusMessage } from "./notifications";
import { PENDING_EXPIRY_MS } from "./order-expiry";

const PAID_STATUSES = ["paid", "packed", "shipped", "completed"];

async function restoreStock(tx: Prisma.TransactionClient, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });

  for (const item of items) {
    if (item.variantId) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.qty } },
      });
    }
    if (item.productId) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.qty } },
      });
    }
  }
}

/**
 * Memesan ulang stok saat pesanan dibatalkan diaktifkan kembali (un-cancel).
 * Mengecek ketersediaan dulu supaya tidak ada pengurangan parsial, lalu
 * mengurangi stok. Mengembalikan false kalau stok tidak cukup.
 */
async function reserveStock(tx: Prisma.TransactionClient, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });

  for (const item of items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true },
      });
      if (!variant || variant.stock < item.qty) return false;
    }
    if (item.productId) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { stock: true },
      });
      if (!product || product.stock < item.qty) return false;
    }
  }

  for (const item of items) {
    if (item.variantId) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.qty } },
      });
    }
    if (item.productId) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      });
    }
  }

  return true;
}

export async function applyStatusChange(
  orderId: string,
  nextStatus: string,
  cancelReason?: string,
  options?: { notify?: boolean },
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        number: true,
        customerName: true,
        total: true,
        paymentMethod: true,
        phone: true,
        status: true,
        paymentStatus: true,
      },
    });
    if (!order) return { changed: false, reason: "not-found" as const };
    if (order.status === nextStatus) {
      return { changed: false, reason: "unchanged" as const };
    }

    const becomingCancelled = nextStatus === "cancelled";
    const leavingCancelled = order.status === "cancelled";
    const becomingPaid =
      PAID_STATUSES.includes(nextStatus) && order.paymentStatus !== "paid";

    if (becomingCancelled && !leavingCancelled && !cancelReason) {
      return { changed: false, reason: "reason-required" as const };
    }

    if (leavingCancelled && !becomingCancelled) {
      const reserved = await reserveStock(tx, orderId);
      if (!reserved) {
        return { changed: false, reason: "insufficient-stock" as const };
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        cancelReason: becomingCancelled ? cancelReason ?? null : null,
        ...(becomingPaid
          ? { paymentStatus: "paid", paidAt: new Date() }
          : {}),
      },
    });

    if (becomingCancelled && !leavingCancelled) {
      await restoreStock(tx, orderId);
    }

    if (options?.notify !== false) {
      await tx.notificationOutbox.create({
        data: {
          orderId,
          phone: order.phone,
          message: buildStatusMessage(
            {
              number: order.number,
              customerName: order.customerName,
              total: order.total,
              paymentMethod: order.paymentMethod,
              cancelReason: becomingCancelled ? cancelReason : null,
            },
            nextStatus,
          ),
        },
      });
    }

    return { changed: true, reason: "ok" as const };
  });
}

export async function cancelExpiredPendingOrders() {
  const cutoff = new Date(Date.now() - PENDING_EXPIRY_MS);
  const expired = await prisma.order.findMany({
    where: {
      status: "pending",
      paymentStatus: { not: "paid" },
      createdAt: { lt: cutoff },
    },
    select: { id: true },
  });

  const reason =
    "Pembayaran tidak diterima dalam 3 hari, pesanan otomatis dibatalkan.";
  let cancelled = 0;

  for (const order of expired) {
    const result = await applyStatusChange(order.id, "cancelled", reason);
    if (result.changed) cancelled += 1;
  }

  return cancelled;
}

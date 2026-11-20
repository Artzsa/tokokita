import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { buildStatusMessage } from "./notifications";

const PENDING_EXPIRY_MS = 3 * 24 * 60 * 60 * 1000;

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

export async function applyStatusChange(
  orderId: string,
  nextStatus: string,
  cancelReason?: string,
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
      },
    });
    if (!order) return { changed: false, reason: "not-found" as const };
    if (order.status === nextStatus) {
      return { changed: false, reason: "unchanged" as const };
    }

    const becomingCancelled = nextStatus === "cancelled";
    const leavingCancelled = order.status === "cancelled";

    if (becomingCancelled && !leavingCancelled && !cancelReason) {
      return { changed: false, reason: "reason-required" as const };
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        cancelReason: becomingCancelled ? cancelReason ?? null : null,
      },
    });

    if (becomingCancelled && !leavingCancelled) {
      await restoreStock(tx, orderId);
    }

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

    return { changed: true, reason: "ok" as const };
  });
}

export async function cancelExpiredPendingOrders() {
  const cutoff = new Date(Date.now() - PENDING_EXPIRY_MS);
  const expired = await prisma.order.findMany({
    where: { status: "pending", createdAt: { lt: cutoff } },
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

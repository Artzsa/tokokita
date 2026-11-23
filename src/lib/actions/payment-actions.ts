"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { applyStatusChange } from "@/lib/order-status";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidateOrder(id: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  revalidatePath(`/admin/pesanan/${id}`);
  revalidatePath("/pesanan");
}

export async function markOrderPaidAction(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  const note = text(formData, "paymentNote").slice(0, 300);
  if (!id) return;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, paymentStatus: true },
  });
  if (!order || order.paymentStatus === "paid") return;

  await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: "paid",
      paidAt: new Date(),
      paymentNote: note || null,
    },
  });

  if (order.status === "pending") {
    await applyStatusChange(id, "paid");
  }

  revalidateOrder(id);
}

export async function unmarkOrderPaidAction(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  if (!id) return;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, paymentStatus: true },
  });
  if (!order || order.paymentStatus !== "paid") return;

  await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: "unpaid",
      paidAt: null,
      paymentNote: null,
    },
  });

  if (order.status === "paid") {
    await applyStatusChange(id, "pending", undefined, { notify: false });
  }

  revalidateOrder(id);
}

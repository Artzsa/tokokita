import { prisma } from "./db";
import { buildStatusMessage } from "./notifications";

export async function enqueueStatusNotification(
  orderId: string,
  status: string,
  cancelReason?: string | null,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      number: true,
      customerName: true,
      total: true,
      paymentMethod: true,
      phone: true,
    },
  });
  if (!order) return null;

  return prisma.notificationOutbox.create({
    data: {
      orderId,
      phone: order.phone,
      message: buildStatusMessage(
        {
          number: order.number,
          customerName: order.customerName,
          total: order.total,
          paymentMethod: order.paymentMethod,
          cancelReason,
        },
        status,
      ),
    },
  });
}

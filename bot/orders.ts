import { prisma } from "../src/lib/db";
import { formatIDR, orderStatusLabel } from "../src/lib/format";
import { normalizePhone } from "../src/lib/phone";

const ORDER_PATTERN = /TK-\d{6}-[A-Z0-9]{4}/i;

export async function answerOrderLookup(text: string, senderPhone: string) {
  const match = text.match(ORDER_PATTERN);
  if (!match) return null;

  const number = match[0].toUpperCase();
  const order = await prisma.order.findUnique({
    where: { number },
    include: { items: { orderBy: { id: "asc" } } },
  });

  if (!order) {
    return `Nomor pesanan ${number} tidak ditemukan. Coba cek lagi ya.`;
  }

  if (normalizePhone(order.phone) !== normalizePhone(senderPhone.split(":")[0])) {
    return "Nomor ini tidak cocok dengan nomor pemesan. Detail pesanan hanya dikirim ke nomor yang terdaftar ya.";
  }

  const items = order.items
    .map((item) => `• ${item.name} × ${item.qty} (${formatIDR(item.price)})`)
    .join("\n");

  const lines = [
    `Pesanan ${order.number}`,
    `Status: ${orderStatusLabel(order.status)}`,
    `Total: ${formatIDR(order.total)}`,
    "",
    items,
  ];

  if (order.cancelReason) lines.push("", `Alasan pembatalan: ${order.cancelReason}`);

  return lines.join("\n");
}

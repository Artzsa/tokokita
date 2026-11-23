import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PAID_STATUSES = ["paid", "packed", "shipped", "completed"];

async function main() {
  const orders = await prisma.order.findMany({
    where: {
      status: { in: PAID_STATUSES },
      paymentStatus: "unpaid",
    },
    select: { id: true, updatedAt: true },
  });

  for (const order of orders) {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "paid", paidAt: order.updatedAt },
    });
  }

  const oldPaymentRule = await prisma.botRule.findFirst({
    where: {
      answer: { contains: "Pembayaran bisa lewat transfer bank atau bayar" },
    },
  });

  if (oldPaymentRule) {
    await prisma.botRule.update({
      where: { id: oldPaymentRule.id },
      data: {
        keywords: "bayar, pembayaran, transfer, cod, qris",
        answer:
          "Pembayaran bisa lewat transfer bank, QRIS, atau bayar di tempat (COD). Instruksi transfer dan QRIS tampil di halaman pesanan. QRIS hanya ditampilkan 10 menit, lalu bisa dimunculkan lagi. Setelah membayar, kirim bukti lewat WhatsApp karena admin mencocokkan pembayaran secara manual.",
      },
    });
  }

  console.log(
    `Pesanan ditandai lunas: ${orders.length}. Aturan bot diperbarui: ${oldPaymentRule ? 1 : 0}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

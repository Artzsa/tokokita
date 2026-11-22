import { prisma } from "./db";
import { formatIDR } from "./format";
import { store } from "./store";

const defaultRules = [
  {
    keywords: "ongkir, kirim, pengiriman, ekspedisi",
    answer: `Ongkir tetap ${formatIDR(store.flatShipping)} per pesanan, gratis untuk subtotal di atas ${formatIDR(store.freeShippingThreshold)}. Pesanan disiapkan manual, jadi statusnya berubah setelah admin mencatatnya.`,
  },
  {
    keywords: "bayar, pembayaran, transfer, cod",
    answer:
      "Pembayaran bisa lewat transfer bank atau bayar di tempat (COD). Instruksi transfer muncul di halaman pesanan setelah checkout.",
  },
  {
    keywords: "retur, rusak, komplain, tukar, garansi",
    answer:
      "Belum ada formulir pengembalian otomatis. Kirim nomor pesanan dan foto barang lewat chat ini. Jangan kirim barang kembali sebelum ada konfirmasi dari admin.",
  },
  {
    keywords: "jam, buka, kontak, alamat, lokasi, whatsapp",
    answer:
      "Untuk urusan yang tidak bisa dijawab otomatis, kirim pesan di nomor ini dan tunggu balasan admin. Belum ada jam balasan tetap.",
  },
  {
    keywords: "produk, katalog, harga, barang",
    answer:
      "Katalog berisi perkakas rumah, tas, dan alat kerja. Lihat semua produk dan stok terbaru di situs Toko Kita, atau sebutkan nama barang yang kamu cari.",
  },
];

export async function ensureDefaultRules() {
  const count = await prisma.botRule.count();
  if (count > 0) return;

  await prisma.botRule.createMany({
    data: defaultRules.map((rule, position) => ({
      ...rule,
      position,
    })),
  });
}

export async function getRules() {
  await ensureDefaultRules();
  return prisma.botRule.findMany({
    where: { enabled: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
}

export function matchRule(text: string, rules: { keywords: string; answer: string }[]) {
  const normalized = text.toLowerCase();
  return rules.find((rule) =>
    rule.keywords
      .split(",")
      .map((keyword) => keyword.trim().toLowerCase())
      .filter(Boolean)
      .some((keyword) => normalized.includes(keyword)),
  );
}

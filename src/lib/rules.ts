import { prisma } from "./db";
import { formatIDR } from "./format";
import { store } from "./store";

const defaultRules = [
  {
    keywords: "ongkir, kirim, pengiriman, ekspedisi",
    answer: `Ongkir ${formatIDR(store.flatShipping)}, gratis untuk subtotal di atas ${formatIDR(store.freeShippingThreshold)}. Pesanan diproses 1–2 hari kerja dan dikirim dari ${store.city}.`,
  },
  {
    keywords: "bayar, pembayaran, transfer, cod",
    answer:
      "Pembayaran bisa lewat transfer bank atau bayar di tempat (COD). Instruksi transfer muncul di halaman pesanan setelah checkout.",
  },
  {
    keywords: "retur, rusak, komplain, tukar, garansi",
    answer:
      "Kalau barang rusak saat kirim, lapor dalam 3 hari dengan foto. Kami ganti atau kembalikan uang. Jahitan dan fitting bergaransi 6 bulan.",
  },
  {
    keywords: "jam, buka, kontak, alamat, lokasi, whatsapp",
    answer: `Kami balas ${store.hours}. Bengkel di ${store.address}. Email: ${store.email}.`,
  },
  {
    keywords: "produk, katalog, harga, barang",
    answer:
      "Katalog berisi perkakas rumah, tas, dan alat kerja dalam batch kecil. Lihat semua produk di situs Toko Kita, atau tanya nama barang yang kamu cari.",
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

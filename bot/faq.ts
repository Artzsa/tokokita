import { formatIDR } from "../src/lib/format";
import { store } from "../src/lib/store";

const answers: { match: RegExp; text: string }[] = [
  {
    match: /ongkir|kirim|pengiriman|ekspedisi/i,
    text: `Ongkir ${formatIDR(store.flatShipping)}, gratis untuk subtotal di atas ${formatIDR(store.freeShippingThreshold)}. Pesanan diproses 1–2 hari kerja dan dikirim dari ${store.city}.`,
  },
  {
    match: /bayar|pembayaran|transfer|cod/i,
    text: "Pembayaran bisa lewat transfer bank atau bayar di tempat (COD). Instruksi transfer muncul di halaman pesanan setelah checkout.",
  },
  {
    match: /retur|rusak|komplain|tukar|garansi/i,
    text: "Kalau barang rusak saat kirim, lapor dalam 3 hari dengan foto. Kami ganti atau kembalikan uang. Jahitan dan fitting bergaransi 6 bulan.",
  },
  {
    match: /jam|buka|kontak|alamat|lokasi|whatsapp/i,
    text: `Kami balas ${store.hours}. Bengkel di ${store.address}. Email: ${store.email}.`,
  },
  {
    match: /produk|katalog|harga|barang/i,
    text: `Katalog berisi perkakas rumah, tas, dan alat kerja dalam batch kecil. Lihat semua produk di situs Toko Kita, atau tanya nama barang yang kamu cari.`,
  },
];

export function answerFaq(text: string) {
  const hit = answers.find((item) => item.match.test(text));
  return hit?.text ?? null;
}

export function helpMessage() {
  return [
    "Halo! Saya bot Toko Kita. Saya bisa bantu:",
    "• Cek pesanan — kirim nomor seperti TK-261120-XXXX",
    "• Ongkir & pengiriman",
    "• Pembayaran / COD",
    "• Retur, garansi, dan jam buka",
    "",
    "Kalau butuh bantuan langsung, admin kami akan membalas ya.",
  ].join("\n");
}

export const store = {
  name: "Toko Kita",
  legalName: "Toko Kita Studio",
  tagline: "Benda harian yang dipilih untuk dipakai lama.",
  intro:
    "Perkakas rumah, tas, dan benda kecil lain yang dipilih satu per satu. Stok dihitung dari sisa, dan setiap pesanan dicek manual.",
  freeShippingThreshold: 500_000,
  // Sementara 0 supaya total pembayaran sama dengan subtotal saat uji QRIS.
  // Kembalikan ke 22_000 kalau ongkir manual atau otomatis sudah dipakai.
  flatShipping: 0,
} as const;

export function shippingFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= store.freeShippingThreshold ? 0 : store.flatShipping;
}

export const store = {
  name: "Toko Kita",
  legalName: "Toko Kita Studio",
  tagline: "Benda harian yang dibuat untuk dipakai lama.",
  intro:
    "Kami membuat dan memilih perkakas rumah, tas, dan benda kecil lain yang jujur bahan, rapi jahitannya, dan tidak berhenti dipakai setelah sebulan.",
  city: "Yogyakarta",
  address: "Jalan Suryodiningratan 18, Yogyakarta 55141",
  email: "halo@tokokita.test",
  whatsapp: "6283822144337",
  instagram: "@tokokita.studio",
  hours: "Senin–Sabtu, 09.00–17.00 WIB",
  freeShippingThreshold: 500_000,
  flatShipping: 22_000,
  bank: {
    name: "BCA",
    number: "1234567890",
    holder: "Toko Kita Studio",
  },
  established: "2026",
} as const;

export function shippingFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= store.freeShippingThreshold ? 0 : store.flatShipping;
}

export function whatsappLink(message: string) {
  return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`;
}

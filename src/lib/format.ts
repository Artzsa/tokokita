export function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export const orderStatuses = [
  "pending",
  "paid",
  "packed",
  "shipped",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<string, string> = {
  pending: "Menunggu pembayaran",
  paid: "Sudah dibayar",
  packed: "Dikemas",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export function orderStatusLabel(status: string) {
  return orderStatusLabels[status] ?? status;
}

export const paymentStatusLabels: Record<string, string> = {
  unpaid: "Belum dibayar",
  paid: "Lunas",
  refunded: "Dikembalikan",
};

export function paymentStatusLabel(status: string) {
  return paymentStatusLabels[status] ?? status;
}

export function paymentMethodLabel(method: string) {
  if (method === "cod") return "COD";
  if (method === "qris") return "QRIS";
  return "Transfer bank";
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function orderNumber(date = new Date()) {
  const stamp = date
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")
    .slice(2);
  // 8 karakter dari alfabet tanpa karakter ambigu (0/O, 1/I).
  // 32^8 ≈ 1,1 triliun kemungkinan per hari, jauh lebih sulit ditebak
  // daripada 4 karakter sebelumnya. getRandomValues aman di server & browser.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  let random = "";
  for (const byte of bytes) random += alphabet[byte % alphabet.length];
  return `TK-${stamp}-${random}`;
}

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
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TK-${stamp}-${random}`;
}

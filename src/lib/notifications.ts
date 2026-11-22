import { formatIDR } from "./format";
import { store } from "./store";

export type NotificationOrder = {
  number: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  cancelReason?: string | null;
};

export function buildStatusMessage(
  order: NotificationOrder,
  status: string,
): string {
  const name = order.customerName.split(" ")[0];

  switch (status) {
    case "pending":
      return `Halo ${name}, pesananmu sudah tercatat dengan nomor ${order.number}. Total ${formatIDR(order.total)}, dibayar lewat ${order.paymentMethod === "cod" ? "COD" : "transfer bank"}. Terima kasih sudah belanja di ${store.name}.`;
    case "paid":
      return `Halo ${name}, pembayaran pesanan ${order.number} sebesar ${formatIDR(order.total)} sudah kami terima. Terima kasih! Barang akan segera kami kemas.`;
    case "packed":
      return `Halo ${name}, pesanan ${order.number} sedang kami kemas. Setelah diserahkan ke kurir kami kabari lagi ya.`;
    case "shipped":
      return `Halo ${name}, pesanan ${order.number} sudah kami serahkan ke kurir. Nomor resi dikirim terpisah kalau sudah tersedia.`;
    case "completed":
      return `Halo ${name}, pesanan ${order.number} sudah selesai. Terima kasih sudah belanja di ${store.name}. Kalau ada pertanyaan, balas pesan ini ya.`;
    case "cancelled": {
      const reason = order.cancelReason
        ? ` Alasan: ${order.cancelReason}.`
        : "";
      return `Halo ${name}, pesanan ${order.number} dibatalkan.${reason} Kalau pembayaran sudah masuk, admin akan menghubungi soal pengembalian. Hubungi ${store.name} kalau ada yang ingin ditanyakan.`;
    }
    default:
      return `Halo ${name}, ada pembaruan untuk pesanan ${order.number}. Hubungi ${store.name} untuk detailnya.`;
  }
}

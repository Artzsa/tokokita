import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { DashboardRange } from "@/components/admin/dashboard-range";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, formatIDR } from "@/lib/format";
import { getDashboardData, parseRange, rangeLabel } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Ringkasan" };

const SALES_SUMMARY_MIN_ORDERS = 10;

type ActionItem = {
  label: string;
  detail: string;
  count: number;
  href: string;
};

function ageLabel(date: Date | null) {
  if (!date) return "";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "hari ini";
  if (days === 1) return "kemarin";
  return `${days} hari lalu`;
}

function ActionGroup({
  title,
  items,
  urgent = false,
}: {
  title: string;
  items: ActionItem[];
  urgent?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-6 first:mt-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
        {title}
      </p>
      <div className="mt-2 border-t border-line">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-line py-4 transition-colors hover:bg-paper-deep/40"
          >
            <span
              className={`display text-2xl tabular-nums ${
                urgent ? "text-clay" : "text-ink-soft"
              }`}
            >
              {item.count}
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-medium">{item.label}</span>
              <span className="mt-0.5 block text-[12px] leading-relaxed text-muted">
                {item.detail}
              </span>
            </span>
            <span className="text-[12px] font-medium text-ink-soft underline-offset-4 group-hover:underline">
              Buka
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const range = parseRange(params.range);
  const data = await getDashboardData(range);

  const pendingAge = ageLabel(data.oldestPendingAt);

  const urgent: ActionItem[] = [];
  const check: ActionItem[] = [];

  if (data.pendingCount > 0) {
    urgent.push({
      label: "Menunggu pembayaran",
      detail: `Cek transfer, lalu ubah status. Pesanan tertua ${pendingAge}.`,
      count: data.pendingCount,
      href: "/admin/pesanan?status=pending",
    });
  }

  if (data.paidCount > 0) {
    urgent.push({
      label: "Dibayar, belum dikemas",
      detail: "Siapkan barang dan catat nomor pengiriman.",
      count: data.paidCount,
      href: "/admin/pesanan?status=paid",
    });
  }

  if (data.lowStockCount > 0) {
    check.push({
      label: "Stok menipis atau habis",
      detail: "Produk aktif dengan sisa lima unit atau kurang.",
      count: data.lowStockCount,
      href: "/admin/produk?stok=menipis",
    });
  }

  if (data.outbox.failed > 0) {
    check.push({
      label: "Pesan bot gagal terkirim",
      detail: "Buka pengaturan untuk mengirim ulang setelah bot tersambung.",
      count: data.outbox.failed,
      href: "/admin/pengaturan#pesan-gagal",
    });
  }

  const totalActions = urgent.reduce((sum, item) => sum + item.count, 0) +
    check.reduce((sum, item) => sum + item.count, 0);

  let summary = "Tidak ada yang perlu diproses saat ini.";
  if (data.pendingCount > 0) {
    summary = `Ada ${data.pendingCount} pesanan menunggu pembayaran, tertua ${pendingAge}.`;
    if (data.paidCount > 0) {
      summary += ` ${data.paidCount} pesanan sudah dibayar dan siap dikemas.`;
    }
  } else if (data.paidCount > 0) {
    summary = `Ada ${data.paidCount} pesanan yang sudah dibayar dan siap dikemas.`;
  } else if (totalActions > 0) {
    summary = `Ada ${totalActions} hal yang perlu dicek hari ini.`;
  }

  const primary =
    data.pendingCount > 0
      ? { href: "/admin/pesanan?status=pending", label: "Buka pesanan pending" }
      : data.paidCount > 0
        ? { href: "/admin/pesanan?status=paid", label: "Siapkan pesanan" }
        : data.outbox.failed > 0
          ? { href: "/admin/pengaturan#pesan-gagal", label: "Kirim ulang pesan" }
          : { href: "/admin/produk/baru", label: "Produk baru" };

  const botLabel: Record<string, string> = {
    connected: "tersambung",
    starting: "menyala",
    connecting: "menghubungkan",
    waiting_scan: "menunggu scan QR",
    waiting_pair: "menunggu pairing",
    disconnected: "terputus",
    reconnecting: "menyambung ulang",
    offline: "mati",
  };
  const botConnected = data.botStatus === "connected";
  const enoughSales = data.orderCount >= SALES_SUMMARY_MIN_ORDERS;

  const queueHint =
    data.pendingCount > 0
      ? "Mulai dari pesanan yang paling lama menunggu."
      : data.paidCount > 0
        ? "Pesanan yang sudah dibayar menunggu disiapkan."
        : "Cek stok dan pesan bot yang gagal.";

  return (
    <div className="px-5 py-8 md:px-10 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div className="max-w-xl">
          <p className="eyebrow">Ringkasan</p>
          <h1 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.8rem)]">
            Halo, {admin.name.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DashboardRange current={range} />
          <Link href={primary.href} className="btn btn-solid">
            {primary.label}
          </Link>
          {primary.href !== "/admin/produk/baru" ? (
            <Link href="/admin/produk/baru" className="btn btn-ghost">
              <Plus size={14} />
              Produk baru
            </Link>
          ) : null}
        </div>
      </header>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-line px-4 py-3">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-[12px]">
            <span
              aria-hidden="true"
              className={`inline-block size-2 rounded-full ${
                botConnected ? "bg-moss" : "bg-clay"
              }`}
            />
            <span className="font-medium">
              Bot WhatsApp {botLabel[data.botStatus] ?? data.botStatus}
            </span>
            <span className="text-muted">
              Outbox {data.outbox.pending} menunggu, {data.outbox.sent}{" "}
              terkirim, {data.outbox.failed} gagal
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {data.outbox.failed > 0 ? (
            <Link
              href="/admin/pengaturan#pesan-gagal"
              className="link-underline text-[12px] font-medium text-clay hover:text-clay-deep"
            >
              Kirim ulang
            </Link>
          ) : null}
          <Link
            href={
              botConnected
                ? "/admin/pengaturan"
                : "/admin/pengaturan#koneksi-whatsapp"
            }
            className="link-underline text-[12px] font-medium text-ink-soft hover:text-ink"
          >
            {botConnected ? "Atur bot" : "Hubungkan WhatsApp"}
          </Link>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="perlu-dikerjakan">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
          <div>
            <h2
              id="perlu-dikerjakan"
              className="text-[12px] font-semibold uppercase tracking-[0.12em]"
            >
              Perlu dikerjakan
            </h2>
            {totalActions > 0 ? (
              <p className="mt-1 text-[11px] text-muted">{queueHint}</p>
            ) : null}
          </div>
          {totalActions > 0 ? (
            <p className="text-[11px] text-muted">{totalActions} item</p>
          ) : null}
        </div>

        {totalActions === 0 ? (
          <div className="border-b border-line py-8">
            <p className="text-sm font-medium">Tidak ada yang menunggu.</p>
            <p className="mt-1 max-w-md text-[13px] leading-relaxed text-muted">
              Pesanan baru, stok menipis, dan pesan bot yang gagal akan muncul
              di bagian ini.
            </p>
          </div>
        ) : (
          <div>
            <ActionGroup title="Perlu sekarang" items={urgent} urgent />
            <ActionGroup title="Perlu dicek" items={check} />
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-3">
        <Link
          href="/admin/pesanan"
          className="group bg-paper p-5 transition-colors hover:bg-paper-deep/40"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            Pendapatan
          </p>
          <p className="display mt-2 text-2xl tabular-nums">
            {formatIDR(data.revenue)}
          </p>
          <p className="mt-2 text-[11px] text-muted">
            Status dibayar ke atas, {rangeLabel(range).toLowerCase()}
          </p>
        </Link>
        <Link
          href="/admin/pesanan"
          className="group bg-paper p-5 transition-colors hover:bg-paper-deep/40"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            Pesanan
          </p>
          <p className="display mt-2 text-2xl tabular-nums">
            {data.orderCount}
          </p>
          <p className="mt-2 text-[11px] text-muted">
            Tidak termasuk pesanan yang dibatalkan
          </p>
        </Link>
        <Link
          href="/admin/produk"
          className="group bg-paper p-5 transition-colors hover:bg-paper-deep/40"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            Produk aktif
          </p>
          <p className="display mt-2 text-2xl tabular-nums">
            {data.activeProducts}
          </p>
          <p className="mt-2 text-[11px] text-muted">Tampil di katalog</p>
        </Link>
      </div>

      {enoughSales ? (
        <div className="mt-10 grid gap-10 xl:grid-cols-2">
          <section>
            <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em]">
                Terlaris
              </h2>
              <span className="text-[11px] text-muted">
                {rangeLabel(range)} · jumlah unit
              </span>
            </div>
            <ol className="border-b border-line">
              {data.topProducts.map((product, index) => (
                <li
                  key={product.name}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-t border-line py-4 text-[13px]"
                >
                  <span className="display w-6 text-lg text-muted">
                    {index + 1}
                  </span>
                  <span className="min-w-0 truncate">{product.name}</span>
                  <span className="tabular-nums text-ink-soft">
                    {product.qty} unit
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em]">
                Penjualan per kategori
              </h2>
              <span className="text-[11px] text-muted">
                {rangeLabel(range)}
              </span>
            </div>
            <ul className="border-b border-line">
              {data.categories.map((category) => {
                const totalRevenue = data.categories.reduce(
                  (sum, item) => sum + item.revenue,
                  0,
                );
                const share =
                  totalRevenue > 0
                    ? Math.round((category.revenue / totalRevenue) * 100)
                    : 0;
                return (
                  <li
                    key={category.name}
                    className="border-t border-line py-4 text-[13px]"
                  >
                    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 sm:grid-cols-[1fr_auto_auto]">
                      <span className="truncate">{category.name}</span>
                      <span className="tabular-nums text-muted">
                        {category.qty} unit
                      </span>
                      <span className="tabular-nums font-medium sm:text-right">
                        {formatIDR(category.revenue)}
                        <span className="ml-2 text-[10px] text-muted">
                          {share}%
                        </span>
                      </span>
                    </div>
                    <div className="mt-3 h-1 bg-paper-deep">
                      <div
                        className="h-full bg-clay"
                        style={{ width: `${Math.max(share, 2)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      ) : (
        <section className="mt-10 border border-line bg-paper-deep/30 p-6">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em]">
            Penjualan
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            Belum cukup data untuk merangkum produk terlaris dan kategori.
            Bagian ini muncul setelah ada minimal {SALES_SUMMARY_MIN_ORDERS}{" "}
            pesanan di rentang {rangeLabel(range).toLowerCase()}.
          </p>
          <p className="mt-2 text-[12px] text-muted">
            Saat ini {data.orderCount} pesanan. Data tetap tersimpan dan tidak
            dihapus.
          </p>
        </section>
      )}

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em]">
              Pesanan terbaru
            </h2>
            <p className="mt-1 text-[11px] text-muted">
              Tidak termasuk pesanan yang dibatalkan.
            </p>
          </div>
          <Link
            href="/admin/pesanan"
            className="link-underline text-[12px] font-medium text-muted hover:text-ink"
          >
            Lihat semua
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <div className="border-b border-line py-8">
            <p className="text-sm">Belum ada pesanan aktif.</p>
            <p className="mt-1 text-[12px] text-muted">
              Pesanan pertama akan muncul di sini setelah ada yang checkout.
            </p>
            <Link
              href="/"
              target="_blank"
              className="link-underline mt-3 inline-block text-[12px] font-medium text-clay"
            >
              Buka toko
            </Link>
          </div>
        ) : (
          <>
            <ul className="border-b border-line sm:hidden">
              {data.recentOrders.map((order) => (
                <li key={order.id} className="border-t border-line py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/pesanan/${order.id}`}
                        className="font-mono text-[12px] hover:text-clay"
                      >
                        {order.number}
                      </Link>
                      <p className="mt-1 truncate text-[13px] font-medium">
                        {order.customerName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {order.city} · {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] tabular-nums">
                        {formatIDR(order.total)}
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[620px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line text-[10px] uppercase tracking-[0.1em] text-muted">
                    <th className="py-3 pr-4 font-semibold">Nomor</th>
                    <th className="py-3 pr-4 font-semibold">Pemesan</th>
                    <th className="py-3 pr-4 font-semibold">Tanggal</th>
                    <th className="py-3 pr-4 text-right font-semibold">Total</th>
                    <th className="py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-line text-[13px] transition-colors hover:bg-paper-deep/40"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/pesanan/${order.id}`}
                          className="font-mono text-[12px] hover:text-clay"
                        >
                          {order.number}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-muted">
                          {order._count.items} barang
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <p>{order.customerName}</p>
                        <p className="text-[11px] text-muted">{order.city}</p>
                      </td>
                      <td className="py-3 pr-4 text-[12px] text-muted">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {formatIDR(order.total)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

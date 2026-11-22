import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { DashboardRange } from "@/components/admin/dashboard-range";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, formatIDR } from "@/lib/format";
import { getDashboardData, parseRange, rangeLabel } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Ringkasan" };

type ActionItem = {
  label: string;
  detail: string;
  count: number;
  href: string;
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const range = parseRange(params.range);
  const data = await getDashboardData(range);

  const actionItems: ActionItem[] = [];

  if (data.pendingCount > 0) {
    actionItems.push({
      label: "Menunggu pembayaran",
      detail: "Cek transfer, lalu ubah status atau batalkan pesanan.",
      count: data.pendingCount,
      href: "/admin/pesanan?status=pending",
    });
  }

  if (data.paidCount > 0) {
    actionItems.push({
      label: "Dibayar, belum dikemas",
      detail: "Siapkan barang dan catat nomor pengiriman.",
      count: data.paidCount,
      href: "/admin/pesanan?status=paid",
    });
  }

  if (data.lowStockCount > 0) {
    actionItems.push({
      label: "Stok menipis atau habis",
      detail: "Produk aktif dengan sisa lima unit atau kurang.",
      count: data.lowStockCount,
      href: "/admin/produk?stok=menipis",
    });
  }

  if (data.outbox.failed > 0) {
    actionItems.push({
      label: "Pesan bot gagal terkirim",
      detail: "Pesan gagal setelah batas percobaan. Cek status bot, lalu hubungi pelanggan manual.",
      count: data.outbox.failed,
      href: "/admin/pengaturan",
    });
  }

  const botConnected = data.botStatus === "connected";

  return (
    <div className="px-5 py-8 md:px-10 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Ringkasan</p>
          <h1 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.8rem)]">
            Halo, {admin.name.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-[13px] text-muted">
            Mulai dari yang perlu dikerjakan, lalu lihat angka {rangeLabel(range).toLowerCase()}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DashboardRange current={range} />
          <Link href="/admin/produk/baru" className="btn btn-solid">
            <Plus size={14} />
            Produk baru
          </Link>
        </div>
      </header>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-line px-4 py-3">
        <p className="flex flex-wrap items-center gap-2 text-[12px]">
          <span
            aria-hidden="true"
            className={`inline-block size-2 rounded-full ${
              botConnected ? "bg-moss" : "bg-clay"
            }`}
          />
          <span className="font-medium">
            Bot WhatsApp {botConnected ? "tersambung" : "belum tersambung"}
          </span>
          <span className="text-muted">
            Outbox {data.outbox.pending} menunggu, {data.outbox.sent} terkirim,{" "}
            {data.outbox.failed} gagal
          </span>
        </p>
        <Link
          href="/admin/pengaturan"
          className="link-underline text-[12px] font-medium text-ink-soft hover:text-ink"
        >
          Atur bot
        </Link>
      </section>

      <section className="mt-8" aria-labelledby="perlu-dikerjakan">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
          <h2
            id="perlu-dikerjakan"
            className="text-[12px] font-semibold uppercase tracking-[0.12em]"
          >
            Perlu dikerjakan
          </h2>
          {actionItems.length > 0 ? (
            <p className="text-[11px] text-muted">
              {actionItems.reduce((sum, item) => sum + item.count, 0)} item
            </p>
          ) : null}
        </div>

        {actionItems.length === 0 ? (
          <div className="border-b border-line py-8">
            <p className="text-sm font-medium">Tidak ada yang menunggu.</p>
            <p className="mt-1 max-w-md text-[13px] leading-relaxed text-muted">
              Pesanan baru, stok menipis, dan pesan bot yang gagal akan muncul
              di bagian ini.
            </p>
          </div>
        ) : (
          <div>
            {actionItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-line py-5 transition-colors hover:bg-paper-deep/40"
              >
                <span className="display text-3xl tabular-nums text-clay">
                  {item.count}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium">
                    {item.label}
                  </span>
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
        )}
      </section>

      <dl className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-3">
        <div className="bg-paper p-5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            Pendapatan
          </dt>
          <dd className="display mt-2 text-2xl tabular-nums">
            {formatIDR(data.revenue)}
          </dd>
          <p className="mt-2 text-[11px] text-muted">
            Status dibayar ke atas, {rangeLabel(range).toLowerCase()}
          </p>
        </div>
        <div className="bg-paper p-5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            Pesanan
          </dt>
          <dd className="display mt-2 text-2xl tabular-nums">
            {data.orderCount}
          </dd>
          <p className="mt-2 text-[11px] text-muted">
            Tidak termasuk pesanan yang dibatalkan
          </p>
        </div>
        <div className="bg-paper p-5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            Produk aktif
          </dt>
          <dd className="display mt-2 text-2xl tabular-nums">
            {data.activeProducts}
          </dd>
          <p className="mt-2 text-[11px] text-muted">Tampil di katalog</p>
        </div>
      </dl>

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
          {data.topProducts.length === 0 ? (
            <div className="border-b border-line py-8">
              <p className="text-sm">Belum ada penjualan di rentang ini.</p>
              <p className="mt-1 text-[12px] text-muted">
                Ubah rentang ke semua waktu kalau ingin melihat data lama.
              </p>
            </div>
          ) : (
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
          )}
        </section>

        <section>
          <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em]">
              Penjualan per kategori
            </h2>
            <span className="text-[11px] text-muted">{rangeLabel(range)}</span>
          </div>
          {data.categories.length === 0 ? (
            <div className="border-b border-line py-8">
              <p className="text-sm">Belum ada data penjualan.</p>
              <p className="mt-1 text-[12px] text-muted">
                Kategori muncul setelah ada item yang terjual.
              </p>
            </div>
          ) : (
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
          )}
        </section>
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em]">
            Pesanan terbaru
          </h2>
          <Link
            href="/admin/pesanan"
            className="link-underline text-[12px] font-medium text-muted hover:text-ink"
          >
            Lihat semua
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <div className="border-b border-line py-8">
            <p className="text-sm">Belum ada pesanan masuk.</p>
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
          <div className="overflow-x-auto">
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
        )}
      </section>
    </div>
  );
}

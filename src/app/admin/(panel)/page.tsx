import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { DashboardRange } from "@/components/admin/dashboard-range";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, formatIDR } from "@/lib/format";
import { getDashboardData, parseRange, rangeLabel } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Ringkasan" };

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const range = parseRange(params.range);
  const data = await getDashboardData(range);

  const actionItems = [
    {
      label: "Menunggu pembayaran",
      count: data.pendingCount,
      href: "/admin/pesanan?status=pending",
      tone: "text-clay-deep",
    },
    {
      label: "Dibayar, belum dikemas",
      count: data.paidCount,
      href: "/admin/pesanan?status=paid",
      tone: "text-moss",
    },
    {
      label: "Sudah dikirim",
      count: data.shippedCount,
      href: "/admin/pesanan?status=shipped",
      tone: "text-ink",
    },
  ];

  return (
    <div className="px-5 py-8 md:px-10 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Ringkasan</p>
          <h1 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.8rem)]">
            Halo, {admin.name.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-[13px] text-muted">
            Data diambil langsung dari database. Rentang: {data.label}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DashboardRange current={range} />
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/produk/baru" className="btn btn-solid">
              <Plus size={14} />
              Produk baru
            </Link>
            <Link href="/admin/pesanan" className="btn btn-ghost">
              Semua pesanan
            </Link>
          </div>
        </div>
      </header>

      <dl className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-paper p-5">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Pendapatan
          </dt>
          <dd className="display mt-2 text-2xl tabular-nums">
            {formatIDR(data.revenue)}
          </dd>
          <p className="mt-2 text-[11px] text-muted">Status dibayar ke atas</p>
        </div>
        <div className="bg-paper p-5">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Pesanan
          </dt>
          <dd className="display mt-2 text-2xl tabular-nums">
            {data.orderCount}
          </dd>
          <p className="mt-2 text-[11px] text-muted">Tidak dibatalkan</p>
        </div>
        <div className="bg-paper p-5">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Menunggu bayar
          </dt>
          <dd className="display mt-2 text-2xl tabular-nums">
            {data.pendingCount}
          </dd>
          <p className="mt-2 text-[11px] text-muted">Perlu dicek & konfirmasi</p>
        </div>
        <div className="bg-paper p-5">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Produk aktif
          </dt>
          <dd className="display mt-2 text-2xl tabular-nums">
            {data.activeProducts}
          </dd>
          <p className="mt-2 text-[11px] text-muted">Tampil di katalog</p>
        </div>
      </dl>

      <section className="mt-6 border border-line bg-paper-deep/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              WhatsApp bot
            </p>
            <p className="mt-1 flex items-center gap-2 text-[13px] font-medium">
              <span
                className={`inline-block size-2 rounded-full ${
                  data.botStatus === "connected" ? "bg-moss" : "bg-clay"
                }`}
              />
              {data.botStatus === "connected"
                ? "Tersambung"
                : data.botStatus === "offline"
                  ? "Mati"
                  : data.botStatus}
            </p>
            <p className="mt-1 text-[11px] text-muted">
              Outbox: {data.outbox.pending} menunggu · {data.outbox.sent} terkirim ·{" "}
              {data.outbox.failed} gagal
            </p>
          </div>
          <Link href="/admin/pengaturan" className="btn btn-ghost">
            Atur bot
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <div className="border-b border-line pb-3">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em]">
            Butuh tindakan
          </h2>
        </div>
        <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
          {actionItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group bg-paper p-5 transition-colors hover:bg-paper-deep/50"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                {item.label}
              </p>
              <p className={`display mt-3 text-3xl tabular-nums ${item.tone}`}>
                {item.count}
              </p>
              <p className="mt-3 flex items-center gap-1 text-[11px] text-muted group-hover:text-ink">
                Buka
                <ArrowUpRight size={12} />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <section>
          <div className="flex items-end justify-between border-b border-line pb-3">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em]">
              Terlaris
            </h2>
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted">
              {rangeLabel(range)} · quantity
            </span>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="border-b border-line py-10 text-sm text-muted">
              Belum ada penjualan di rentang ini.
            </p>
          ) : (
            <ol className="border-b border-line">
              {data.topProducts.map((product, index) => (
                <li
                  key={product.name}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-t border-line py-4 text-[13px]"
                >
                  <span className="display text-lg text-muted">
                    0{index + 1}
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
          <div className="flex items-end justify-between border-b border-line pb-3">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em]">
              Penjualan per kategori
            </h2>
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted">
              {rangeLabel(range)}
            </span>
          </div>
          {data.categories.length === 0 ? (
            <p className="border-b border-line py-10 text-sm text-muted">
              Belum ada data penjualan.
            </p>
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
                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
                      <span className="truncate">{category.name}</span>
                      <span className="tabular-nums text-muted">
                        {category.qty} unit
                      </span>
                      <span className="tabular-nums font-medium">
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

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em]">
            Pesanan terbaru
          </h2>
          <Link
            href="/admin/pesanan"
            className="link-underline text-[11px] font-semibold uppercase tracking-[0.12em] text-muted"
          >
            Lihat semua
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <p className="border-b border-line py-10 text-sm text-muted">
            Belum ada pesanan masuk.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[10px] uppercase tracking-[0.12em] text-muted">
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

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em]">
            Stok menipis
          </h2>
          <Link
            href="/admin/produk"
            className="link-underline text-[11px] font-semibold uppercase tracking-[0.12em] text-muted"
          >
            Kelola
          </Link>
        </div>

        {data.lowStock.length === 0 ? (
          <p className="border-b border-line py-10 text-sm text-muted">
            Semua stok masih aman.
          </p>
        ) : (
          <ul>
            {data.lowStock.map((product) => (
              <li
                key={product.key}
                className="flex items-center gap-4 border-b border-line py-3"
              >
                <div className="relative size-12 shrink-0 overflow-hidden bg-paper-deep">
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px]">{product.name}</p>
                  <p className="text-[11px] text-muted">
                    {product.kind} · {product.stock} tersisa
                  </p>
                </div>
                <span
                  className={`text-[12px] font-medium tabular-nums ${
                    product.stock <= 2 ? "text-clay" : "text-muted"
                  }`}
                >
                  {product.stock}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

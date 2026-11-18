import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  formatDateTime,
  formatIDR,
  orderStatusLabel,
  orderStatuses,
} from "@/lib/format";

export const metadata: Metadata = { title: "Pesanan" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status =
    typeof params.status === "string" &&
    (orderStatuses as readonly string[]).includes(params.status)
      ? params.status
      : "";

  const where: Prisma.OrderWhereInput = status ? { status } : {};

  const [orders, grouped, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.count(),
  ]);

  const counts = new Map(grouped.map((row) => [row.status, row._count._all]));

  return (
    <div className="px-5 py-8 md:px-10 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Penjualan</p>
          <h1 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.8rem)]">
            Pesanan
          </h1>
          <p className="mt-2 text-[13px] text-muted">
            {orders.length} pesanan ditampilkan dari {total} total.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 py-5">
        <Link
          href="/admin/pesanan"
          className={`tag ${!status ? "tag-active" : "hover:border-ink"}`}
        >
          Semua
          <span className="text-[9px] opacity-60">{total}</span>
        </Link>
        {orderStatuses.map((entry) => (
          <Link
            key={entry}
            href={`/admin/pesanan?status=${entry}`}
            className={`tag ${status === entry ? "tag-active" : "hover:border-ink"}`}
          >
            {orderStatusLabel(entry)}
            <span className="text-[9px] opacity-60">{counts.get(entry) ?? 0}</span>
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="mt-4 border border-dashed border-line px-6 py-14 text-center">
          <p className="display text-2xl">Belum ada pesanan di sini.</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
            Pesanan dari toko akan muncul otomatis. Coba pilih filter lain.
          </p>
        </div>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-[0.12em] text-muted">
                <th className="py-3 pr-4 font-semibold">Nomor</th>
                <th className="py-3 pr-4 font-semibold">Tanggal</th>
                <th className="py-3 pr-4 font-semibold">Pemesan</th>
                <th className="py-3 pr-4 text-right font-semibold">Barang</th>
                <th className="py-3 pr-4 font-semibold">Bayar</th>
                <th className="py-3 pr-4 text-right font-semibold">Total</th>
                <th className="py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-line text-[13px] transition-colors hover:bg-paper-deep/30"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/pesanan/${order.id}`}
                      className="font-mono text-[12px] hover:text-clay"
                    >
                      {order.number}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-[12px] text-muted">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="py-3 pr-4">
                    <p>{order.customerName}</p>
                    <p className="text-[11px] text-muted">{order.city}</p>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-muted">
                    {order._count.items}
                  </td>
                  <td className="py-3 pr-4 text-[11px] uppercase tracking-[0.08em] text-muted">
                    {order.paymentMethod === "cod" ? "COD" : "Transfer"}
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
    </div>
  );
}

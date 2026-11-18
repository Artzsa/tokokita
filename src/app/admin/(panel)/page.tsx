import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime, formatIDR } from "@/lib/format";

export const metadata: Metadata = { title: "Ringkasan" };

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [revenue, pendingCount, activeProducts, lowStock, recentOrders, orderCount] =
    await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ["paid", "packed", "shipped"] } },
      }),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.product.count({ where: { status: "active" } }),
      prisma.product.findMany({
        where: { status: "active", stock: { lte: 5 } },
        include: { images: { take: 1 } },
        orderBy: { stock: "asc" },
        take: 5,
      }),
      prisma.order.findMany({
        include: { _count: { select: { items: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.order.count(),
    ]);

  const stats = [
    {
      label: "Pendapatan tercatat",
      value: formatIDR(revenue._sum.total ?? 0),
      hint: "Pesanan berstatus dibayar, dikemas, dikirim",
    },
    {
      label: "Menunggu pembayaran",
      value: String(pendingCount),
      hint: "Perlu dicek dan dikonfirmasi",
    },
    {
      label: "Produk aktif",
      value: String(activeProducts),
      hint: "Tampil di katalog toko",
    },
    {
      label: "Total pesanan",
      value: String(orderCount),
      hint: "Sejak toko dibuka",
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
            Ini kondisi toko saat ini. Data diambil langsung dari database.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/produk/baru" className="btn btn-solid">
            <Plus size={14} />
            Produk baru
          </Link>
          <Link href="/admin/pesanan" className="btn btn-ghost">
            Semua pesanan
          </Link>
        </div>
      </header>

      <dl className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-paper p-5">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {stat.label}
            </dt>
            <dd className="display mt-2 text-2xl tabular-nums">{stat.value}</dd>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              {stat.hint}
            </p>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.6fr_1fr]">
        <section>
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

          {recentOrders.length === 0 ? (
            <p className="border-b border-line py-10 text-sm text-muted">
              Belum ada pesanan masuk.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
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
                  {recentOrders.map((order) => (
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

        <section>
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

          {lowStock.length === 0 ? (
            <p className="border-b border-line py-10 text-sm text-muted">
              Semua stok masih aman.
            </p>
          ) : (
            <ul>
              {lowStock.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center gap-4 border-b border-line py-3"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden bg-paper-deep">
                    <Image
                      src={product.images[0]?.url ?? "/uploads/placeholder.svg"}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/produk/${product.id}`}
                      className="block truncate text-[13px] hover:text-clay"
                    >
                      {product.name}
                    </Link>
                    <p className="text-[11px] text-muted">
                      {product.stock} tersisa · {formatIDR(product.price)}
                    </p>
                  </div>
                  <Link
                    href={`/admin/produk/${product.id}`}
                    aria-label={`Ubah ${product.name}`}
                    className="text-muted hover:text-ink"
                  >
                    <ArrowUpRight size={15} />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/admin/kategori"
            className="mt-6 flex items-center justify-between border border-line px-4 py-3 text-[12px] font-medium transition-colors hover:border-ink"
          >
            Kelola kategori
            <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </div>
  );
}

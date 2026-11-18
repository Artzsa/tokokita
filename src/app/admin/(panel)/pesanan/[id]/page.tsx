import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  formatDateTime,
  formatIDR,
  orderStatusLabel,
  orderStatuses,
} from "@/lib/format";
import { updateOrderStatusAction } from "@/lib/actions/admin-actions";

export const metadata: Metadata = { title: "Detail pesanan" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { slug: true } } },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!order) notFound();

  const waNumber = order.phone.replace(/\D/g, "").replace(/^0/, "62");
  const waText = encodeURIComponent(
    `Halo ${order.customerName}, ini Toko Kita soal pesanan ${order.number}.`,
  );

  return (
    <div className="px-5 py-8 md:px-10 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <Link
            href="/admin/pesanan"
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted hover:text-ink"
          >
            <ArrowLeft size={13} />
            Kembali ke pesanan
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="display text-[clamp(1.7rem,3vw,2.4rem)]">
              {order.number}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-[12px] text-muted">
            Dibuat {formatDateTime(order.createdAt)} · diperbarui{" "}
            {formatDateTime(order.updatedAt)}
          </p>
        </div>
        <Link href={`/pesanan/${order.number}`} target="_blank" className="btn btn-ghost">
          Halaman pesanan
        </Link>
      </header>

      <div className="mt-6 grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Barang
            </h2>
            <div className="mt-3 border-t border-line">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-baseline justify-between gap-4 border-b border-line py-4 text-[13px]"
                >
                  <div>
                    <p className="font-medium">
                      {item.product ? (
                        <Link
                          href={`/produk/${item.product.slug}`}
                          target="_blank"
                          className="hover:text-clay"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      {item.variantLabel ? `${item.variantLabel} · ` : ""}
                      {item.qty} × {formatIDR(item.price)}
                    </p>
                  </div>
                  <span className="shrink-0 tabular-nums">
                    {formatIDR(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <dl className="mt-4 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatIDR(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Ongkir</dt>
                <dd className="tabular-nums">
                  {order.shipping === 0 ? "Gratis" : formatIDR(order.shipping)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="font-medium">Total</dt>
                <dd className="display text-xl tabular-nums">
                  {formatIDR(order.total)}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Catatan pembeli
            </h2>
            <p className="mt-3 border-t border-line pt-4 text-[13px] leading-relaxed text-ink-soft">
              {order.notes ?? "Tidak ada catatan."}
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Alamat pengiriman
            </h2>
            <p className="mt-3 border-t border-line pt-4 text-[13px] leading-relaxed text-ink-soft">
              {order.customerName}
              <br />
              {order.address}
              <br />
              {order.city} {order.postalCode}
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-line bg-paper p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Ubah status
            </h2>
            <form action={updateOrderStatusAction} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <label htmlFor="status" className="sr-only">
                Status pesanan
              </label>
              <select
                key={order.status}
                id="status"
                name="status"
                defaultValue={order.status}
                className="input"
              >
                {orderStatuses.map((entry) => (
                  <option key={entry} value={entry}>
                    {orderStatusLabel(entry)}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-solid w-full">
                Simpan status
              </button>
            </form>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Status saat ini: {orderStatusLabel(order.status)}. Pembeli melihat
              perubahan ini di halaman pesanan.
            </p>
          </section>

          <section className="border border-line bg-paper p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Kontak pembeli
            </h2>
            <ul className="mt-4 space-y-3 text-[13px]">
              <li className="flex items-start gap-2">
                <Phone size={14} className="mt-0.5 shrink-0 text-muted" />
                {order.phone}
              </li>
              <li className="flex items-start gap-2">
                <Mail size={14} className="mt-0.5 shrink-0 text-muted" />
                <a href={`mailto:${order.email}`} className="link-underline">
                  {order.email}
                </a>
              </li>
            </ul>
            <a
              href={`https://wa.me/${waNumber}?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost mt-4 w-full"
            >
              <MessageCircle size={14} />
              WhatsApp pembeli
            </a>
          </section>

          <section className="border border-line bg-paper p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Pembayaran
            </h2>
            <dl className="mt-4 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted">Metode</dt>
                <dd>{order.paymentMethod === "cod" ? "COD" : "Transfer bank"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Status</dt>
                <dd>{orderStatusLabel(order.status)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2">
                <dt className="text-muted">Jumlah</dt>
                <dd className="tabular-nums">{formatIDR(order.total)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

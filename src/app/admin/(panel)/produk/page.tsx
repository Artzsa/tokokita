import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Check, Plus, Search, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatIDR } from "@/lib/format";
import { deleteProductAction } from "@/lib/actions/admin-actions";

export const metadata: Metadata = { title: "Produk" };

const statusLabels: Record<string, string> = {
  draft: "Draf",
  active: "Aktif",
  archived: "Arsip",
};

const statusTone: Record<string, string> = {
  draft: "text-muted",
  active: "text-moss",
  archived: "text-clay",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const where: Prisma.ProductWhereInput = q
    ? { OR: [{ name: { contains: q } }, { slug: { contains: q } }] }
    : {};

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { take: 1, orderBy: { position: "asc" } },
      category: true,
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="px-5 py-8 md:px-10 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Katalog</p>
          <h1 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.8rem)]">
            Produk
          </h1>
          <p className="mt-2 text-[13px] text-muted">
            {products.length} produk{ q ? ` cocok dengan “${q}”` : " terdaftar" }.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form action="/admin/produk" className="flex items-center border border-line">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari nama atau slug…"
              aria-label="Cari produk"
              className="w-44 bg-transparent px-3 py-2 text-[12px] outline-none placeholder:text-muted/70"
            />
            <button
              type="submit"
              aria-label="Cari"
              className="px-3 py-2 text-muted hover:text-ink"
            >
              <Search size={14} />
            </button>
          </form>
          <Link href="/admin/produk/baru" className="btn btn-solid">
            <Plus size={14} />
            Produk baru
          </Link>
        </div>
      </header>

      {params.saved === "1" ? (
        <p className="mt-5 flex items-center gap-2 border border-moss/30 bg-moss/5 px-4 py-3 text-[13px] text-moss">
          <Check size={15} />
          Produk berhasil disimpan.
        </p>
      ) : null}
      {params.deleted === "1" ? (
        <p className="mt-5 flex items-center gap-2 border border-line bg-paper-deep/50 px-4 py-3 text-[13px] text-ink-soft">
          <Trash2 size={15} />
          Produk sudah dihapus dari katalog.
        </p>
      ) : null}

      {products.length === 0 ? (
        <div className="mt-10 border border-dashed border-line px-6 py-14 text-center">
          <p className="display text-2xl">
            {q ? "Tidak ada produk yang cocok." : "Katalog masih kosong."}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
            {q
              ? "Coba kata kunci lain, atau tambahkan produk baru."
              : "Tambahkan produk pertama, lengkap dengan foto dan stoknya."}
          </p>
          <Link href="/admin/produk/baru" className="btn btn-solid mt-6">
            <Plus size={14} />
            Produk baru
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-[0.12em] text-muted">
                <th className="py-3 pr-4 font-semibold">Produk</th>
                <th className="py-3 pr-4 font-semibold">Kategori</th>
                <th className="py-3 pr-4 text-right font-semibold">Harga</th>
                <th className="py-3 pr-4 text-right font-semibold">Stok</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-line align-middle text-[13px] transition-colors hover:bg-paper-deep/30"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden bg-paper-deep">
                        <Image
                          src={product.images[0]?.url ?? "/uploads/placeholder.svg"}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/produk/${product.id}`}
                          className="block truncate font-medium hover:text-clay"
                        >
                          {product.name}
                        </Link>
                        <p className="truncate font-mono text-[11px] text-muted">
                          /{product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted">{product.category.name}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {formatIDR(product.price)}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    <span className={product.stock <= 5 ? "text-clay" : ""}>
                      {product.stock}
                    </span>
                    {product._count.variants > 0 ? (
                      <span className="block text-[10px] text-muted">
                        {product._count.variants} varian
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                        statusTone[product.status] ?? "text-muted"
                      }`}
                    >
                      <span className="inline-block size-1.5 rounded-full bg-current" />
                      {statusLabels[product.status] ?? product.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/produk/${product.id}`}
                        className="link-underline text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft"
                      >
                        Ubah
                      </Link>
                      <details className="relative">
                        <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.1em] text-muted hover:text-clay">
                          Hapus
                        </summary>
                        <div className="absolute right-0 z-20 mt-2 w-56 border border-line bg-paper p-3 shadow-sm">
                          <p className="text-[11px] leading-relaxed text-muted">
                            Hapus <strong className="text-ink">{product.name}</strong>{" "}
                            dari katalog? Riwayat pesanan tetap tersimpan.
                          </p>
                          <form action={deleteProductAction} className="mt-3">
                            <input type="hidden" name="id" value={product.id} />
                            <button type="submit" className="btn btn-ghost w-full">
                              Ya, hapus
                            </button>
                          </form>
                        </div>
                      </details>
                    </div>
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

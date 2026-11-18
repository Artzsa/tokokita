import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ArrowRight, SearchX } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Katalog",
  description:
    "Semua produk Toko Kita: perkakas rumah, tas, alat kerja, dan kain tenun dalam jumlah kecil.",
};

type CatalogSearch = {
  kategori?: string | string[];
  urut?: string | string[];
  q?: string | string[];
};

const sortOptions = [
  { value: "baru", label: "Terbaru" },
  { value: "laris", label: "Paling dipesan" },
  { value: "murah", label: "Harga terendah" },
  { value: "mahal", label: "Harga tertinggi" },
  { value: "nama", label: "Nama A–Z" },
];

function single(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearch>;
}) {
  const params = await searchParams;
  const kategori = single(params.kategori)?.trim() || "";
  const q = single(params.q)?.trim() || "";
  const urut = single(params.urut) || "baru";

  const where: Prisma.ProductWhereInput = { status: "active" };
  if (kategori) where.category = { slug: kategori };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { tagline: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    urut === "murah"
      ? { price: "asc" }
      : urut === "mahal"
        ? { price: "desc" }
        : urut === "nama"
          ? { name: "asc" }
          : urut === "laris"
            ? { orderItems: { _count: "desc" } }
            : { createdAt: "desc" };

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { position: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: "asc" } } },
      orderBy,
    }),
  ]);

  const activeCategory = categories.find((category) => category.slug === kategori);

  function hrefFor(next: Record<string, string | undefined>) {
    const merged: Record<string, string | undefined> = {
      kategori: kategori || undefined,
      q: q || undefined,
      urut: urut === "baru" ? undefined : urut,
      ...next,
    };
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value) search.set(key, value);
    }
    const query = search.toString();
    return query ? `/produk?${query}` : "/produk";
  }

  const hasFilter = Boolean(kategori || q);

  return (
    <div className="wrap pt-12 md:pt-16">
      <header className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">Katalog {new Date().getFullYear()}</p>
          <h1 className="display mt-4 text-[clamp(2.6rem,6vw,4.6rem)]">
            {activeCategory ? activeCategory.name : "Semua benda"}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            {activeCategory
              ? activeCategory.blurb
              : "Dibuat dalam batch kecil, diuji sebelum dijual, dan bisa diperbaiki kalau rusak. Harga sudah termasuk kemasan kertas."}
          </p>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {products.length} produk
        </p>
      </header>

      <div className="grid gap-6 border-b border-line py-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-wrap gap-2">
          <Link
            href={hrefFor({ kategori: undefined })}
            className={`tag ${!kategori ? "tag-active" : "hover:border-ink"}`}
          >
            Semua
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={hrefFor({ kategori: category.slug })}
              className={`tag ${
                kategori === category.slug ? "tag-active" : "hover:border-ink"
              }`}
            >
              {category.name}
              <span className="text-[9px] opacity-60">
                {category._count.products}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <form action="/produk" className="flex items-center border border-line">
            {kategori ? (
              <input type="hidden" name="kategori" value={kategori} />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari produk…"
              aria-label="Cari produk"
              className="w-40 bg-transparent px-3 py-2 text-[13px] outline-none placeholder:text-muted/70 sm:w-52"
            />
            <button
              type="submit"
              className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
            >
              Cari
            </button>
          </form>

          <form action="/produk" className="flex items-center gap-2">
            {kategori ? (
              <input type="hidden" name="kategori" value={kategori} />
            ) : null}
            {q ? <input type="hidden" name="q" value={q} /> : null}
            <label htmlFor="urut" className="sr-only">
              Urutkan
            </label>
            <select
              id="urut"
              name="urut"
              defaultValue={urut}
              className="border border-line bg-transparent px-3 py-2 text-[12px] text-ink-soft outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="border border-line px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft hover:border-ink hover:text-ink"
            >
              Terapkan
            </button>
          </form>
        </div>
      </div>

      {hasFilter ? (
        <div className="flex flex-wrap items-center gap-3 py-4 text-[12px] text-muted">
          <span>Filter aktif:</span>
          {activeCategory ? (
            <span className="tag">{activeCategory.name}</span>
          ) : null}
          {q ? <span className="tag">“{q}”</span> : null}
          <Link
            href="/produk"
            className="link-underline text-[11px] uppercase tracking-[0.12em] text-clay"
          >
            Bersihkan
          </Link>
        </div>
      ) : null}

      {products.length > 0 ? (
        <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              preload={index < 3}
            />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-start gap-6 border border-dashed border-line px-8 py-16">
          <SearchX size={28} strokeWidth={1.2} className="text-clay" />
          <div>
            <h2 className="display text-2xl">Belum ada yang cocok.</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Coba kata kunci lain, atau lihat seluruh katalog. Kalau barang yang
              kamu cari belum ada, bilang saja — kadang kami bisa buatkan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/produk" className="btn btn-solid">
              Lihat semua produk
            </Link>
            <Link href="/kontak" className="btn btn-ghost">
              Minta produk
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Plus, Truck } from "lucide-react";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { Product3D } from "@/components/product-3d";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { prisma } from "@/lib/db";
import { formatIDR } from "@/lib/format";
import { store } from "@/lib/store";

type Params = { slug: string };

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "active" },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { label: "asc" } },
      category: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produk tidak ditemukan" };

  return {
    title: product.name,
    description: product.tagline,
    openGraph: {
      title: `${product.name} — ${store.name}`,
      description: product.tagline,
      images: product.images[0]?.url ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      status: "active",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { images: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "asc" },
    take: 3,
  });

  const image = product.images[0];
  const totalStock =
    product.variants.length > 0
      ? product.variants.reduce((sum, variant) => sum + variant.stock, 0)
      : product.stock;

  const discount = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : 0;

  const details = [
    { label: "Bahan", value: product.material },
    { label: "Ukuran", value: product.dimensions },
    { label: "Perawatan", value: product.care },
    { label: "Asal", value: product.origin },
  ].filter((item) => Boolean(item.value));

  return (
    <div className="wrap pt-6">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted"
      >
        <Link href="/produk" className="hover:text-ink">
          Katalog
        </Link>
        <ChevronRight size={11} />
        <Link
          href={`/produk?kategori=${product.category.slug}`}
          className="hover:text-ink"
        >
          {product.category.name}
        </Link>
        <ChevronRight size={11} />
        <span className="text-ink-soft">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="self-start lg:sticky lg:top-32">
          <div className="tk-hero-media relative aspect-[4/5] overflow-hidden bg-paper-deep">
            <Product3D
              src={image?.url ?? "/uploads/placeholder.svg"}
              alt={image?.alt ?? product.name}
              preload
              sizes="(min-width: 1024px) 48vw, 100vw"
            />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Foto contoh. Warna bisa sedikit berbeda karena pencahayaan dan layar.
          </p>
        </div>

        <div>
          <p className="eyebrow">{product.category.name}</p>
          <h1 className="display mt-4 text-[clamp(2.4rem,5vw,3.8rem)]">
            {product.name}
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
            {product.tagline}
          </p>

          <div className="mt-7 flex flex-wrap items-baseline gap-3">
            <span className="display text-3xl tabular-nums">
              {formatIDR(product.price)}
            </span>
            {product.compareAt ? (
              <>
                <span className="text-sm text-muted line-through">
                  {formatIDR(product.compareAt)}
                </span>
                <span className="bg-clay px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-paper">
                  −{discount}%
                </span>
              </>
            ) : null}
          </div>

          <p className="mt-3 flex items-center gap-2 text-[12px] text-muted">
            <span
              className={`inline-block size-1.5 rounded-full ${
                totalStock > 0 ? "bg-moss" : "bg-clay"
              }`}
            />
            {totalStock > 0
              ? `Tersedia ${totalStock} unit`
              : "Stok sedang habis"}
          </p>

          <AddToCartForm product={product} variants={product.variants} />

          {details.length > 0 ? (
            <div className="mt-10 border-b border-line">
              {details.map((detail) => (
                <details key={detail.label} className="group border-t border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[12px] font-semibold uppercase tracking-[0.14em]">
                    {detail.label}
                    <Plus
                      size={15}
                      className="text-muted transition-transform duration-300 group-open:rotate-45"
                    />
                  </summary>
                  <p className="pb-4 text-sm leading-relaxed text-ink-soft">
                    {detail.value}
                  </p>
                </details>
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex gap-4 bg-paper-deep/60 p-5">
            <Truck size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-clay" />
            <div className="text-[13px] leading-relaxed text-ink-soft">
              <p className="font-medium">Dikirim dari {store.city}</p>
              <p className="mt-1 text-muted">
                Diproses 1–2 hari kerja. Gratis ongkir di atas{" "}
                {formatIDR(store.freeShippingThreshold)}. Bisa juga ambil di
                bengkel.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <p className="eyebrow">Catatan</p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-24 border-t border-line pt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="display text-[clamp(1.7rem,3vw,2.4rem)]">
              Dari kategori yang sama
            </h2>
            <Link
              href={`/produk?kategori=${product.category.slug}`}
              className="link-underline text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft"
            >
              Lihat semua
            </Link>
          </div>
          <Reveal>
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </Reveal>
        </section>
      ) : null}
    </div>
  );
}

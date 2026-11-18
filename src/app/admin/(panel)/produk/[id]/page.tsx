import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  ProductForm,
  type ProductInitial,
} from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Ubah produk" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { orderBy: { label: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  const initial: ProductInitial = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    tagline: product.tagline,
    description: product.description,
    price: product.price,
    compareAt: product.compareAt,
    stock: product.stock,
    status: product.status,
    material: product.material,
    dimensions: product.dimensions,
    care: product.care,
    origin: product.origin,
    imageUrl: product.images[0]?.url ?? null,
    variants: product.variants.map((variant) => ({
      label: variant.label,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
    })),
  };

  return (
    <div className="px-5 py-8 md:px-10 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <Link
            href="/admin/produk"
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted hover:text-ink"
          >
            <ArrowLeft size={13} />
            Kembali ke produk
          </Link>
          <h1 className="display mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)]">
            {product.name}
          </h1>
          <p className="mt-2 font-mono text-[11px] text-muted">/{product.slug}</p>
        </div>
        <Link
          href={`/produk/${product.slug}`}
          target="_blank"
          className="btn btn-ghost"
        >
          Lihat di toko
          <ExternalLink size={13} />
        </Link>
      </header>

      <div className="mt-6">
        <ProductForm categories={categories} initial={initial} />
      </div>
    </div>
  );
}

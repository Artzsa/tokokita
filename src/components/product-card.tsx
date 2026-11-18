import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ArrowUpRight } from "lucide-react";
import { Product3D } from "@/components/product-3d";
import { formatIDR } from "@/lib/format";

export type ProductCardProduct = Prisma.ProductGetPayload<{
  include: { images: true };
}>;

export function ProductCard({
  product,
  preload = false,
}: {
  product: ProductCardProduct;
  preload?: boolean;
}) {
  const image = product.images[0];
  const soldOut = product.stock <= 0;

  return (
    <article className="group">
      <Link href={`/produk/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-paper-deep">
          <Product3D
            src={image?.url ?? "/uploads/placeholder.svg"}
            alt={image?.alt ?? product.name}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            preload={preload}
            hoverOnly
          />
          {product.compareAt ? (
            <span className="absolute left-3 top-3 bg-clay px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper">
              Turun harga
            </span>
          ) : null}
          {soldOut ? (
            <span className="absolute left-3 top-3 bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper">
              Stok habis
            </span>
          ) : null}
          <span className="tk-card-cta" aria-hidden="true">
            Lihat
            <ArrowUpRight size={11} />
          </span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-5">
          <div className="min-w-0">
            <h3 className="text-[15px] font-medium leading-snug transition-colors group-hover:text-clay">
              {product.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">
              {product.tagline}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[13px] font-medium">{formatIDR(product.price)}</p>
            {product.compareAt ? (
              <p className="text-[11px] text-muted line-through">
                {formatIDR(product.compareAt)}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

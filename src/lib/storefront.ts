import type { Prisma } from "@prisma/client";
import { prisma } from "./db";

const productInclude = {
  images: { orderBy: { position: "asc" } },
} satisfies Prisma.ProductInclude;

export type HomeProduct = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

const HOME_PRODUCT_LIMIT = 6;

export async function getHomeCatalog() {
  const [productCount, sales, categories] = await Promise.all([
    prisma.product.count({ where: { status: "active" } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        productId: { not: null },
        order: { status: { not: "cancelled" } },
      },
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: HOME_PRODUCT_LIMIT,
    }),
    prisma.category.findMany({
      where: { products: { some: { status: "active" } } },
      orderBy: { position: "asc" },
      include: {
        products: { where: { status: "active" }, select: { id: true } },
      },
    }),
  ]);

  const rankedIds = sales
    .map((row) => row.productId)
    .filter((id): id is string => Boolean(id));

  let products: HomeProduct[] = [];

  if (rankedIds.length > 0) {
    const ranked = await prisma.product.findMany({
      where: { id: { in: rankedIds }, status: "active" },
      include: productInclude,
    });
    const byId = new Map(ranked.map((product) => [product.id, product]));
    products = rankedIds
      .map((id) => byId.get(id))
      .filter((product): product is HomeProduct => Boolean(product));
  }

  // Section "paling sering dipesan" hanya jujur kalau ada cukup data penjualan.
  const bestseller = products.length >= 3;

  if (!bestseller) {
    products = await prisma.product.findMany({
      where: { status: "active" },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: HOME_PRODUCT_LIMIT,
    });
  }

  return {
    products: products.slice(0, bestseller ? 3 : HOME_PRODUCT_LIMIT),
    bestseller,
    productCount,
    categoryCount: categories.length,
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      blurb: category.blurb,
      count: category.products.length,
    })),
  };
}

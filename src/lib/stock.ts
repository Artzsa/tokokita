import { prisma } from "./db";

export const LOW_STOCK_THRESHOLD = 5;

export function getProductStock(product: {
  stock: number;
  variants: { stock: number }[];
}) {
  if (product.variants.length > 0) {
    return Math.min(...product.variants.map((variant) => variant.stock));
  }
  return product.stock;
}

export function stockTone(stock: number) {
  if (stock <= 0) return "out";
  if (stock <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}

export async function getLowStockProducts(excludeId: string, limit = 4) {
  const products = await prisma.product.findMany({
    where: {
      status: "active",
      id: { not: excludeId },
      OR: [
        { stock: { lte: LOW_STOCK_THRESHOLD } },
        { variants: { some: { stock: { lte: LOW_STOCK_THRESHOLD } } } },
      ],
    },
    include: {
      images: { take: 1, orderBy: { position: "asc" } },
      variants: { select: { stock: true } },
    },
    orderBy: { stock: "asc" },
    take: limit * 2,
  });

  return products
    .map((product) => {
      const stock =
        product.variants.length > 0
          ? Math.min(...product.variants.map((variant) => variant.stock))
          : product.stock;
      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        stock,
        image: product.images[0]?.url ?? "/uploads/placeholder.svg",
      };
    })
    .filter((product) => product.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, limit);
}

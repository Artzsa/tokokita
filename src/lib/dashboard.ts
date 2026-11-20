import { prisma } from "./db";
import { getSetting } from "./settings";

export type DashboardRange = "1d" | "7d" | "30d" | "all";

export function parseRange(value: string | undefined): DashboardRange {
  if (value === "1d" || value === "7d" || value === "30d" || value === "all") {
    return value;
  }
  return "30d";
}

export function rangeStart(range: DashboardRange) {
  if (range === "all") return null;
  const days = range === "1d" ? 1 : range === "7d" ? 7 : 30;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

export function rangeLabel(range: DashboardRange) {
  if (range === "1d") return "Hari ini";
  if (range === "7d") return "7 hari terakhir";
  if (range === "30d") return "30 hari terakhir";
  return "Semua waktu";
}

export async function getDashboardData(range: DashboardRange) {
  const start = rangeStart(range);
  const orderWhere = {
    status: { not: "cancelled" },
    ...(start ? { createdAt: { gte: start } } : {}),
  };

  const [
    revenue,
    orderCount,
    pendingCount,
    paidCount,
    packedCount,
    shippedCount,
    activeProducts,
    lowStockProducts,
    lowStockVariants,
    recentOrders,
    orderItems,
    botStatus,
    outbox,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["paid", "packed", "shipped", "completed"] },
        ...(start ? { createdAt: { gte: start } } : {}),
      },
    }),
    prisma.order.count({ where: orderWhere }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({ where: { status: "paid" } }),
    prisma.order.count({ where: { status: "packed" } }),
    prisma.order.count({ where: { status: "shipped" } }),
    prisma.product.count({ where: { status: "active" } }),
    prisma.product.findMany({
      where: { status: "active", stock: { lte: 5 } },
      include: { images: { take: 1, orderBy: { position: "asc" } } },
      orderBy: { stock: "asc" },
      take: 6,
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: {
        product: { select: { id: true, name: true, images: { take: 1, orderBy: { position: "asc" } } } },
      },
      orderBy: { stock: "asc" },
      take: 6,
    }),
    prisma.order.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
      take: 7,
    }),
    prisma.orderItem.findMany({
      where: { order: orderWhere },
      include: { product: { select: { id: true, name: true, category: { select: { name: true } } } } },
    }),
    getSetting("bot_status"),
    prisma.notificationOutbox.groupBy({
      by: ["state"],
      _count: { _all: true },
    }),
  ]);

  const productSales = new Map<
    string,
    { name: string; qty: number; revenue: number }
  >();
  const categorySales = new Map<
    string,
    { name: string; qty: number; revenue: number }
  >();

  for (const item of orderItems) {
    const productKey = item.productId ?? item.name;
    const productName = item.product?.name ?? item.name;
    const sale = productSales.get(productKey) ?? {
      name: productName,
      qty: 0,
      revenue: 0,
    };
    sale.qty += item.qty;
    sale.revenue += item.price * item.qty;
    productSales.set(productKey, sale);

    const categoryName = item.product?.category?.name ?? "Tanpa kategori";
    const category = categorySales.get(categoryName) ?? {
      name: categoryName,
      qty: 0,
      revenue: 0,
    };
    category.qty += item.qty;
    category.revenue += item.price * item.qty;
    categorySales.set(categoryName, category);
  }

  const topProducts = [...productSales.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
  const categories = [...categorySales.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const lowStock = [
    ...lowStockProducts.map((product) => ({
      key: `product-${product.id}`,
      name: product.name,
      stock: product.stock,
      image: product.images[0]?.url ?? "/uploads/placeholder.svg",
      kind: "Produk",
    })),
    ...lowStockVariants.map((variant) => ({
      key: `variant-${variant.id}`,
      name: `${variant.label} · ${variant.product?.name ?? "Varian"}`,
      stock: variant.stock,
      image: variant.product?.images[0]?.url ?? "/uploads/placeholder.svg",
      kind: "Varian",
    })),
  ]
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);

  const outboxCounts = new Map(
    outbox.map((row) => [row.state, row._count._all]),
  );

  return {
    range,
    label: rangeLabel(range),
    revenue: revenue._sum.total ?? 0,
    orderCount,
    pendingCount,
    paidCount,
    packedCount,
    shippedCount,
    activeProducts,
    topProducts,
    categories,
    lowStock,
    recentOrders,
    botStatus: botStatus || "offline",
    outbox: {
      pending: outboxCounts.get("pending") ?? 0,
      sent: outboxCounts.get("sent") ?? 0,
      failed: outboxCounts.get("failed") ?? 0,
    },
  };
}

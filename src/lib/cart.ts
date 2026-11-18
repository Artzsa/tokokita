import { cookies } from "next/headers";
import { prisma } from "./db";
import { shippingFor } from "./store";

const CART_COOKIE = "tk_cart";
const MAX_QTY = 20;
const MAX_LINES = 30;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type StoredItem = {
  p: string;
  v: string | null;
  q: number;
};

export type CartLine = {
  key: string;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  image: string;
  variantLabel: string | null;
  unitPrice: number;
  qty: number;
  lineTotal: number;
  maxQty: number;
};

export type Cart = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
};

function cleanItem(value: unknown): StoredItem | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.p !== "string" || candidate.p.length === 0) return null;
  const qty = Math.trunc(Number(candidate.q));
  if (!Number.isFinite(qty) || qty <= 0) return null;
  return {
    p: candidate.p,
    v: typeof candidate.v === "string" && candidate.v.length > 0 ? candidate.v : null,
    q: Math.min(qty, MAX_QTY),
  };
}

export function cartKey(productId: string, variantId: string | null) {
  return `${productId}:${variantId ?? "-"}`;
}

export async function readStoredCart(): Promise<StoredItem[]> {
  const raw = (await cookies()).get(CART_COOKIE)?.value;
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const items: StoredItem[] = [];

    for (const entry of parsed) {
      const item = cleanItem(entry);
      if (!item) continue;
      const key = cartKey(item.p, item.v);
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(item);
      if (items.length >= MAX_LINES) break;
    }

    return items;
  } catch {
    return [];
  }
}

export async function writeStoredCart(items: StoredItem[]) {
  const jar = await cookies();
  const trimmed = items.slice(0, MAX_LINES);
  if (trimmed.length === 0) {
    jar.delete(CART_COOKIE);
    return;
  }
  jar.set(CART_COOKIE, JSON.stringify(trimmed), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearStoredCart() {
  (await cookies()).delete(CART_COOKIE);
}

export async function getCartCount() {
  const items = await readStoredCart();
  return items.reduce((total, item) => total + item.q, 0);
}

export async function getCart(): Promise<Cart> {
  const stored = await readStoredCart();
  if (stored.length === 0) {
    return { lines: [], count: 0, subtotal: 0, shipping: 0, total: 0 };
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: [...new Set(stored.map((item) => item.p))] },
      status: "active",
    },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: true,
    },
  });

  const byId = new Map(products.map((product) => [product.id, product]));
  const lines: CartLine[] = [];

  for (const item of stored) {
    const product = byId.get(item.p);
    if (!product) continue;

    const variant = item.v
      ? product.variants.find((entry) => entry.id === item.v)
      : null;
    if (item.v && !variant) continue;

    const stock = variant ? variant.stock : product.stock;
    if (stock <= 0) continue;

    const unitPrice = variant?.price ?? product.price;
    const qty = Math.min(item.q, stock, MAX_QTY);

    lines.push({
      key: cartKey(product.id, variant?.id ?? null),
      productId: product.id,
      variantId: variant?.id ?? null,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url ?? "/uploads/placeholder.svg",
      variantLabel: variant?.label ?? null,
      unitPrice,
      qty,
      lineTotal: unitPrice * qty,
      maxQty: Math.min(stock, MAX_QTY),
    });
  }

  const count = lines.reduce((total, line) => total + line.qty, 0);
  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
  const shipping = shippingFor(subtotal);

  return { lines, count, subtotal, shipping, total: subtotal + shipping };
}

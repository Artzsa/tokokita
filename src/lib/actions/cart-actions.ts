"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cartKey, readStoredCart, writeStoredCart } from "@/lib/cart";
import { prisma } from "@/lib/db";

const MAX_QTY = 20;

export async function addToCartAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const variantIdRaw = String(formData.get("variantId") ?? "").trim();
  const requestedQty = Math.trunc(Number(formData.get("qty") ?? 1));

  if (!productId) return;

  const product = await prisma.product.findFirst({
    where: { id: productId, status: "active" },
    include: { variants: true },
  });
  if (!product) return;

  const variantId = variantIdRaw.length > 0 ? variantIdRaw : null;
  const variant = variantId
    ? product.variants.find((entry) => entry.id === variantId)
    : null;
  if (variantId && !variant) return;

  const stock = variant?.stock ?? product.stock;
  if (stock <= 0) return;

  const qty = Math.min(
    Math.max(Number.isFinite(requestedQty) ? requestedQty : 1, 1),
    stock,
    MAX_QTY,
  );

  const stored = await readStoredCart();
  const key = cartKey(productId, variantId);
  const existing = stored.find((item) => cartKey(item.p, item.v) === key);

  if (existing) {
    existing.q = Math.min(existing.q + qty, stock, MAX_QTY);
  } else {
    stored.push({ p: productId, v: variantId, q: qty });
  }

  await writeStoredCart(stored);
  revalidatePath("/keranjang");
  redirect("/keranjang?added=1");
}

export async function changeCartQtyAction(formData: FormData) {
  const key = String(formData.get("key") ?? "");
  const delta = Math.trunc(Number(formData.get("delta") ?? 0));
  if (!key || !Number.isFinite(delta) || delta === 0) return;

  const stored = await readStoredCart();
  const item = stored.find((entry) => cartKey(entry.p, entry.v) === key);
  if (!item) return;

  item.q = Math.min(Math.max(item.q + delta, 0), MAX_QTY);

  const next = stored.filter((entry) => entry.q > 0);
  await writeStoredCart(next);
  revalidatePath("/keranjang");
  revalidatePath("/checkout");
}

export async function removeCartItemAction(formData: FormData) {
  const key = String(formData.get("key") ?? "");
  if (!key) return;

  const stored = await readStoredCart();
  await writeStoredCart(stored.filter((entry) => cartKey(entry.p, entry.v) !== key));
  revalidatePath("/keranjang");
  revalidatePath("/checkout");
}

export async function emptyCartAction() {
  await writeStoredCart([]);
  revalidatePath("/keranjang");
  revalidatePath("/checkout");
}

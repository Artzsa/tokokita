"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { orderStatuses, slugify } from "@/lib/format";
import { applyStatusChange } from "@/lib/order-status";

export type ProductFormState = {
  error?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
  nonce?: number;
};

export type CategoryFormState = {
  error?: string;
  ok?: boolean;
  values?: Record<string, string>;
  nonce?: number;
};

export type BotRuleFormState = {
  error?: string;
  ok?: boolean;
  values?: Record<string, string>;
  nonce?: number;
};

const productStatuses = ["draft", "active", "archived"] as const;
const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function productValues(formData: FormData) {
  const keys = [
    "id",
    "name",
    "slug",
    "categoryId",
    "status",
    "tagline",
    "description",
    "price",
    "compareAt",
    "stock",
    "material",
    "dimensions",
    "care",
    "origin",
    "variants",
  ];
  const values: Record<string, string> = {};
  for (const key of keys) values[key] = text(formData, key);
  return values;
}

function toInt(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Math.min(Number(digits), 999_999_999);
}

async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || `produk-${Date.now()}`;
  let candidate = root;
  let counter = 2;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${counter}`;
    counter += 1;
  }
}

async function saveImage(file: File | null, slug: string) {
  if (!file || file.size === 0) return null;

  const extension = imageExtensions[file.type];
  if (!extension) {
    throw new Error("Format foto harus JPG, PNG, WebP, AVIF, atau GIF.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran foto maksimal 5 MB.");
  }

  const directory = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(directory, { recursive: true });

  const filename = `${slug}-${Date.now().toString(36)}.${extension}`;
  await writeFile(
    path.join(directory, filename),
    Buffer.from(await file.arrayBuffer()),
  );

  return `/uploads/products/${filename}`;
}

async function removeUploadedImage(url: string | null | undefined) {
  if (!url || !url.startsWith("/uploads/products/")) return;
  const relative = url.replace(/^\/uploads\/products\//, "");
  if (!relative || relative.includes("..") || relative.includes("/")) return;
  const filePath = path.join(process.cwd(), "public", "uploads", "products", relative);
  await unlink(filePath).catch(() => null);
}

function parseVariants(raw: string, productSlug: string) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const [labelRaw, skuRaw, priceRaw, stockRaw] = line
      .split("|")
      .map((part) => (part ?? "").trim());

    const label = labelRaw || `Varian ${index + 1}`;
    const sku = (skuRaw || `${productSlug}-${index + 1}`)
      .toUpperCase()
      .replace(/\s+/g, "-");
    const price = priceRaw ? toInt(priceRaw) : 0;
    const stock = stockRaw ? toInt(stockRaw) : 0;

    return {
      label,
      sku,
      price: price > 0 ? price : null,
      stock,
    };
  });
}

export async function saveProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const id = text(formData, "id");
  const name = text(formData, "name");
  const slugInput = text(formData, "slug");
  const categoryId = text(formData, "categoryId");
  const tagline = text(formData, "tagline");
  const description = text(formData, "description");
  const price = toInt(text(formData, "price"));
  const compareAtRaw = text(formData, "compareAt");
  const compareAt = compareAtRaw ? toInt(compareAtRaw) : null;
  const stock = toInt(text(formData, "stock"));
  const status = text(formData, "status");
  const material = text(formData, "material");
  const dimensions = text(formData, "dimensions");
  const care = text(formData, "care");
  const origin = text(formData, "origin");
  const variantsRaw = text(formData, "variants");
  const values = productValues(formData);
  const retry = (error: string, errors?: Record<string, string>): ProductFormState => ({
    error,
    errors,
    values,
    nonce: Date.now(),
  });

  const errors: Record<string, string> = {};

  if (name.length < 2) errors.name = "Nama produk minimal 2 karakter.";
  if (!categoryId) errors.categoryId = "Pilih kategori produk.";
  if (tagline.length < 4) errors.tagline = "Tulis satu kalimat pendek sebagai ringkasan.";
  if (description.length < 20)
    errors.description = "Deskripsi minimal 20 karakter. Jelaskan bahan dan pemakaiannya.";
  if (price <= 0) errors.price = "Harga harus lebih dari 0.";
  if (compareAtRaw && (!compareAt || compareAt <= price)) {
    errors.compareAt = "Harga sebelum diskon harus lebih tinggi dari harga jual.";
  }
  if (!productStatuses.includes(status as (typeof productStatuses)[number])) {
    errors.status = "Status produk tidak dikenal.";
  }

  if (Object.keys(errors).length > 0) {
    return retry("Periksa kembali kolom yang ditandai.", errors);
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return retry("Kategori tidak ditemukan. Muat ulang halaman.");

  const slug = await uniqueSlug(slugInput || name, id || undefined);
  const variants = parseVariants(variantsRaw, slug);

  let imageUrl: string | null = null;
  const imageFile = formData.get("image");
  try {
    imageUrl = await saveImage(imageFile instanceof File ? imageFile : null, slug);
  } catch (error) {
    return retry(error instanceof Error ? error.message : "Foto gagal diunggah.");
  }

  const payload = {
    name,
    slug,
    categoryId,
    tagline,
    description,
    price,
    compareAt: compareAt && compareAt > price ? compareAt : null,
    stock,
    status,
    material: material || null,
    dimensions: dimensions || null,
    care: care || null,
    origin: origin || null,
  };

  try {
    if (id) {
      await prisma.$transaction(async (tx) => {
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
        });

        await tx.product.update({ where: { id }, data: payload });

        if (imageUrl) {
          const oldImages = await tx.productImage.findMany({
            where: { productId: id },
            select: { url: true },
          });
          await tx.productImage.deleteMany({ where: { productId: id } });
          await tx.productImage.create({
            data: { productId: id, url: imageUrl, alt: name, position: 0 },
          });
          for (const image of oldImages) await removeUploadedImage(image.url);
        }

        const keptSkus = variants.map((variant) => variant.sku);
        await tx.productVariant.deleteMany({
          where: {
            productId: id,
            sku: keptSkus.length > 0 ? { notIn: keptSkus } : undefined,
          },
        });

        for (const variant of variants) {
          const existing = existingVariants.find((entry) => entry.sku === variant.sku);
          if (existing) {
            await tx.productVariant.update({
              where: { id: existing.id },
              data: {
                label: variant.label,
                price: variant.price,
                stock: variant.stock,
              },
            });
          } else {
            await tx.productVariant.create({
              data: { ...variant, productId: id },
            });
          }
        }
      });
    } else {
      await prisma.product.create({
        data: {
          ...payload,
          images: {
            create: [
              {
                url: imageUrl ?? "/uploads/placeholder.svg",
                alt: name,
                position: 0,
              },
            ],
          },
          variants: { create: variants },
        },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Unique constraint")) {
      return retry("SKU varian sudah dipakai produk lain. Ganti SKU-nya.");
    }
    return retry("Produk gagal disimpan. Coba lagi.");
  }

  revalidatePath("/");
  revalidatePath("/produk");
  revalidatePath(`/produk/${slug}`);
  revalidatePath("/admin/produk");

  redirect("/admin/produk?saved=1");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;

  const images = await prisma.productImage.findMany({
    where: { productId: id },
    select: { url: true },
  });
  await prisma.product.delete({ where: { id } }).catch(() => null);
  for (const image of images) await removeUploadedImage(image.url);

  revalidatePath("/");
  revalidatePath("/produk");
  revalidatePath("/admin/produk");
  redirect("/admin/produk?deleted=1");
}

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();
  const name = text(formData, "name");
  const blurb = text(formData, "blurb");
  const slugInput = text(formData, "slug");
  const values = { name, slug: slugInput, blurb };
  const retry = (error: string): CategoryFormState => ({
    error,
    values,
    nonce: Date.now(),
  });

  if (name.length < 2) return retry("Nama kategori minimal 2 karakter.");

  const slug = slugify(slugInput || name);
  if (!slug) return retry("Slug kategori tidak valid.");

  const clash = await prisma.category.findUnique({ where: { slug } });
  if (clash) return retry("Slug kategori sudah dipakai.");

  const position = await prisma.category.count();

  await prisma.category.create({
    data: { name, slug, blurb: blurb || null, position },
  });

  revalidatePath("/");
  revalidatePath("/produk");
  revalidatePath("/admin/produk");
  return { ok: true };
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status");
  const cancelReason = text(formData, "cancelReason");

  if (!id) return;
  if (!orderStatuses.includes(status as (typeof orderStatuses)[number])) return;

  const result = await applyStatusChange(id, status, cancelReason || undefined);

  if (result.reason === "reason-required") {
    redirect(`/admin/pesanan/${id}?error=reason`);
  }
  if (result.reason === "insufficient-stock") {
    redirect(`/admin/pesanan/${id}?error=stock`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  revalidatePath(`/admin/pesanan/${id}`);
  revalidatePath("/pesanan");
}

export async function saveBotRuleAction(
  _prev: BotRuleFormState,
  formData: FormData,
): Promise<BotRuleFormState> {
  await requireAdmin();

  const id = text(formData, "id");
  const keywords = text(formData, "keywords");
  const answer = text(formData, "answer");
  const enabled = formData.get("enabled") === "on";
  const position = toInt(text(formData, "position"));
  const values = {
    id,
    keywords,
    answer,
    enabled: String(enabled),
    position: String(position),
  };
  const retry = (error: string): BotRuleFormState => ({
    error,
    values,
    nonce: Date.now(),
  });

  if (keywords.length < 2) return retry("Kata kunci minimal 2 karakter.");
  if (answer.length < 10) return retry("Jawaban minimal 10 karakter.");

  try {
    if (id) {
      await prisma.botRule.update({
        where: { id },
        data: { keywords, answer, enabled, position },
      });
    } else {
      const nextPosition =
        position > 0 ? position : (await prisma.botRule.count()) + 1;
      await prisma.botRule.create({
        data: { keywords, answer, enabled, position: nextPosition },
      });
    }
  } catch {
    return retry("Aturan gagal disimpan. Coba lagi.");
  }

  revalidatePath("/admin/rules");
  return { ok: true, nonce: Date.now() };
}

export async function deleteBotRuleAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;

  await prisma.botRule.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/rules");
}

export async function toggleBotRuleAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const enabled = text(formData, "enabled") === "true";
  if (!id) return;

  await prisma.botRule
    .update({ where: { id }, data: { enabled } })
    .catch(() => null);
  revalidatePath("/admin/rules");
}

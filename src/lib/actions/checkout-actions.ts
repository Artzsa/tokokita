"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { clearStoredCart, getCart } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { orderNumber } from "@/lib/format";
import { enqueueStatusNotification } from "@/lib/outbox";
import { shippingFor } from "@/lib/store";
import { getSettings } from "@/lib/settings";
import { qrisIsReady } from "@/lib/business";

export type CheckoutState = {
  error?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

const schema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Nama penerima minimal 2 karakter.")
    .max(80, "Nama terlalu panjang."),
  email: z
    .string()
    .trim()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format email belum benar."),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor WhatsApp minimal 8 digit.")
    .max(20, "Nomor WhatsApp terlalu panjang."),
  address: z
    .string()
    .trim()
    .min(10, "Alamat lengkap minimal 10 karakter.")
    .max(300, "Alamat terlalu panjang."),
  city: z.string().trim().min(2, "Kota/kabupaten wajib diisi."),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4,6}$/, "Kode pos harus 4–6 angka."),
  notes: z.string().trim().max(500, "Catatan maksimal 500 karakter.").optional(),
  paymentMethod: z.enum(["transfer", "cod", "qris"]),
});



export async function placeOrderAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const raw = {
    customerName: String(formData.get("customerName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    paymentMethod: String(formData.get("paymentMethod") ?? "transfer"),
  };

  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return {
      error: "Beberapa kolom perlu diperiksa.",
      errors,
      values: raw,
    };
  }

  const data = parsed.data;
  const cart = await getCart();

  if (data.paymentMethod === "qris") {
    const settings = await getSettings();
    if (!qrisIsReady(settings)) {
      return {
        error:
          "QRIS belum tersedia di toko ini. Pilih transfer bank atau COD dulu.",
        values: raw,
      };
    }
  }

  if (cart.lines.length === 0) {
    return {
      error: "Keranjang kosong. Pilih produk dulu sebelum checkout.",
      values: raw,
    };
  }

  let createdNumber = "";
  let createdId = "";

  try {
    const order = await prisma.$transaction(async (tx) => {
      let number = orderNumber();
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const clash = await tx.order.findUnique({ where: { number } });
        if (!clash) break;
        number = orderNumber();
      }

      const subtotal = cart.lines.reduce((sum, line) => sum + line.lineTotal, 0);
      const shipping = shippingFor(subtotal);

      const record = await tx.order.create({
        data: {
          number,
          customerName: data.customerName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          notes: data.notes && data.notes.length > 0 ? data.notes : null,
          paymentMethod: data.paymentMethod,
          subtotal,
          shipping,
          total: subtotal + shipping,
          status: "pending",
          items: {
            create: cart.lines.map((line) => ({
              productId: line.productId,
              variantId: line.variantId,
              name: line.name,
              variantLabel: line.variantLabel,
              price: line.unitPrice,
              qty: line.qty,
            })),
          },
        },
      });

      for (const line of cart.lines) {
        if (line.variantId) {
          const updated = await tx.productVariant.updateMany({
            where: { id: line.variantId, stock: { gte: line.qty } },
            data: { stock: { decrement: line.qty } },
          });
          if (updated.count === 0) {
            throw new Error(`Stok ${line.name} baru saja habis.`);
          }
          await tx.product.update({
            where: { id: line.productId },
            data: { stock: { decrement: line.qty } },
          });
        } else {
          const updated = await tx.product.updateMany({
            where: { id: line.productId, stock: { gte: line.qty } },
            data: { stock: { decrement: line.qty } },
          });
          if (updated.count === 0) {
            throw new Error(`Stok ${line.name} baru saja habis.`);
          }
        }
      }

      return record;
    });

    createdNumber = order.number;
    createdId = order.id;
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Pesanan gagal dibuat. Coba lagi sebentar.",
      values: raw,
    };
  }

  await enqueueStatusNotification(createdId, "pending").catch(() => null);

  await clearStoredCart();
  redirect(`/pesanan/${createdNumber}`);
}


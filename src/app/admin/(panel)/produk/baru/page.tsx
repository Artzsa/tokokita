import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Produk baru" };

export default async function NewProductPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="px-5 py-8 md:px-10 md:py-10">
      <header className="border-b border-line pb-6">
        <Link
          href="/admin/produk"
          className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted hover:text-ink"
        >
          <ArrowLeft size={13} />
          Kembali ke produk
        </Link>
        <h1 className="display mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)]">
          Produk baru
        </h1>
        <p className="mt-2 text-[13px] text-muted">
          Simpan sebagai draf dulu kalau foto atau deskripsi belum lengkap.
        </p>
      </header>

      <div className="mt-6">
        {categories.length === 0 ? (
          <div className="border border-dashed border-line px-6 py-12">
            <p className="display text-2xl">Buat kategori dulu.</p>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">
              Setiap produk harus punya kategori supaya bisa tampil di katalog.
            </p>
            <Link href="/admin/kategori" className="btn btn-solid mt-6">
              Kelola kategori
            </Link>
          </div>
        ) : (
          <ProductForm categories={categories} />
        )}
      </div>
    </div>
  );
}

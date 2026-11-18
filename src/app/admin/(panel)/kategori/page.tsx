import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Kategori" };

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="px-5 py-8 md:px-10 md:py-10">
      <header className="border-b border-line pb-6">
        <p className="eyebrow">Struktur katalog</p>
        <h1 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.8rem)]">
          Kategori
        </h1>
        <p className="mt-2 text-[13px] text-muted">
          Kategori menentukan filter di katalog dan pengelompokan di beranda.
        </p>
      </header>

      <div className="mt-6 grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <section>
          <div className="border-b border-line pb-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              {categories.length} kategori
            </h2>
          </div>

          {categories.length === 0 ? (
            <p className="py-10 text-sm text-muted">
              Belum ada kategori. Tambahkan yang pertama di samping.
            </p>
          ) : (
            <ul>
              {categories.map((category, index) => (
                <li
                  key={category.id}
                  className="flex items-start justify-between gap-4 border-b border-line py-4"
                >
                  <div className="flex gap-4">
                    <span className="display text-lg text-muted">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="text-[14px] font-medium">{category.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted">
                        /produk?kategori={category.slug}
                      </p>
                      {category.blurb ? (
                        <p className="mt-1 max-w-md text-[12px] leading-relaxed text-muted">
                          {category.blurb}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="text-[11px] uppercase tracking-[0.1em] text-muted">
                      {category._count.products} produk
                    </span>
                    <Link
                      href={`/produk?kategori=${category.slug}`}
                      target="_blank"
                      aria-label={`Lihat kategori ${category.name} di toko`}
                      className="text-muted hover:text-ink"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="border border-line bg-paper p-5 xl:sticky xl:top-6 xl:self-start">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Kategori baru
          </h2>
          <div className="mt-4">
            <CategoryForm />
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-muted">
            Kategori tidak bisa dihapus dari panel. Kalau perlu dihapus, pindahkan
            produknya dulu supaya tidak menggantung.
          </p>
        </aside>
      </div>
    </div>
  );
}

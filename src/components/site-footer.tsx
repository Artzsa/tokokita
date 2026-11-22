import Link from "next/link";
import { prisma } from "@/lib/db";
import { getStoreWhatsapp } from "@/lib/contact";
import { store } from "@/lib/store";

export async function SiteFooter() {
  const [categories, whatsapp] = await Promise.all([
    prisma.category.findMany({
      where: { products: { some: { status: "active" } } },
      orderBy: { position: "asc" },
      take: 3,
      select: { name: true, slug: true },
    }),
    getStoreWhatsapp(),
  ]);

  return (
    <footer className="mt-24 border-t border-line bg-paper-deep">
      <div className="wrap grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="eyebrow">Toko kecil, dikelola sendiri</p>
          <p className="display mt-4 text-4xl">{store.name}</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
            {store.tagline} Katalog, stok, dan pesanan dicatat di toko ini
            sendiri.
          </p>
        </div>

        <div>
          <p className="eyebrow">Belanja</p>
          <ul className="mt-5 space-y-3">
            <li>
              <Link
                href="/produk"
                className="link-underline text-sm text-ink-soft hover:text-ink"
              >
                Semua produk
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/produk?kategori=${category.slug}`}
                  className="link-underline text-sm text-ink-soft hover:text-ink"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Bantuan</p>
          <ul className="mt-5 space-y-3">
            <li>
              <Link
                href="/faq"
                className="link-underline text-sm text-ink-soft hover:text-ink"
              >
                Pertanyaan umum
              </Link>
            </li>
            <li>
              <Link
                href="/kebijakan#pengiriman"
                className="link-underline text-sm text-ink-soft hover:text-ink"
              >
                Pengiriman
              </Link>
            </li>
            <li>
              <Link
                href="/kebijakan#pengembalian"
                className="link-underline text-sm text-ink-soft hover:text-ink"
              >
                Pengembalian
              </Link>
            </li>
            <li>
              <Link
                href="/kontak"
                className="link-underline text-sm text-ink-soft hover:text-ink"
              >
                Hubungi kami
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Kontak</p>
          <ul className="mt-5 space-y-3 text-sm text-ink-soft">
            <li>
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Halo Toko Kita, saya mau tanya produk.")}`}
                target="_blank"
                rel="noreferrer"
                className="link-underline"
              >
                WhatsApp +{whatsapp}
              </a>
            </li>
            <li>
              <Link href="/kontak" className="link-underline">
                Halaman kontak
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="wrap flex flex-col gap-3 border-t border-line py-6 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {store.legalName}. Semua harga dalam
          Rupiah.
        </p>
        <p>Transfer bank dan COD</p>
      </div>
    </footer>
  );
}

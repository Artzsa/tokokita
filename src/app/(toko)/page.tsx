import Link from "next/link";
import { Product3D } from "@/components/product-3d";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { formatIDR } from "@/lib/format";
import { getHomeCatalog } from "@/lib/storefront";
import { store } from "@/lib/store";
import { whatsappLink } from "@/lib/contact";

const process = [
  {
    title: "Stok dihitung dari sisa",
    body: "Jumlah yang tampil di halaman produk berasal dari stok yang tersimpan. Kalau habis, tombol beli dimatikan.",
  },
  {
    title: "Pembayaran dicek manual",
    body: "Transfer, QRIS, dan COD dikonfirmasi admin lewat WhatsApp sebelum pesanan dikemas.",
  },
  {
    title: "Nomor pesanan bisa dibuka lagi",
    body: "Simpan nomor pesanan. Rincian dan status bisa dilihat kapan saja tanpa membuat akun.",
  },
];

export default async function HomePage() {
  const { products, bestseller, productCount, categoryCount, categories } =
    await getHomeCatalog();

  const hero = products[0];
  const heroImage = hero?.images[0];

  return (
    <>
      <section className="wrap pt-10 md:pt-16">
        <div className="grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-clay" />
              Toko kecil, dikelola sendiri
            </p>

            <h1 className="display mt-6 text-[clamp(2.7rem,5.2vw,4.3rem)]">
              Benda harian,
              <br />
              dipilih untuk <span className="italic text-clay">dipakai lama</span>.
            </h1>

            <p className="mt-8 max-w-md text-[15px] leading-relaxed text-ink-soft">
              {store.intro}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/produk" className="btn btn-solid">
                Lihat katalog
              </Link>
              <Link href="/tentang" className="btn btn-outline">
                Cara kami bekerja
              </Link>
            </div>

            <p className="mt-6 text-[12px] font-medium text-muted">
              {productCount} produk aktif · {categoryCount} kategori · gratis
              kirim di atas {formatIDR(store.freeShippingThreshold)}
            </p>
          </div>

          <div className="relative">
            <div className="tk-hero-media relative aspect-[4/5] overflow-hidden bg-paper-deep">
              {heroImage ? (
                <Product3D
                  src={heroImage.url}
                  alt={heroImage.alt}
                  preload
                  sizes="(min-width: 1024px) 46vw, 100vw"
                />
              ) : null}
            </div>

            {hero ? (
              <div className="absolute -bottom-6 left-4 max-w-[240px] border border-line bg-paper p-4 shadow-[0_1px_0_rgba(23,19,16,0.06)] sm:left-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Dari katalog
                </p>
                <p className="mt-2 text-sm font-medium leading-snug">{hero.name}</p>
                <p className="mt-1 text-xs text-muted">{hero.tagline}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[13px] tabular-nums">
                    {formatIDR(hero.price)}
                  </span>
                  <Link
                    href={`/produk/${hero.slug}`}
                    className="link-underline text-[12px] font-medium text-clay"
                  >
                    Lihat produk
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="wrap mt-24">
        <div className="flex items-end justify-between border-b border-line pb-4">
          <p className="eyebrow">Indeks kategori</p>
          <Link
            href="/produk"
            className="link-underline text-[12px] font-medium text-ink-soft"
          >
            Semua produk
          </Link>
        </div>

        <Reveal delay={80}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/produk?kategori=${category.slug}`}
                className="group flex flex-col justify-between border-b border-line py-7 transition-colors hover:bg-paper-deep/50 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0"
              >
                <div>
                  <span className="text-[11px] font-semibold tracking-[0.1em] text-clay">
                    0{index + 1}
                  </span>
                  <h2 className="display mt-3 text-2xl transition-colors group-hover:text-clay">
                    {category.name}
                  </h2>
                  <p className="mt-2 max-w-[26ch] text-[13px] leading-relaxed text-muted">
                    {category.blurb}
                  </p>
                </div>
                <span className="link-underline mt-6 w-fit text-[12px] font-medium text-ink-soft">
                  {category.count} produk
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="wrap mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="eyebrow">
              {bestseller ? "Paling sering dipesan" : "Baru di katalog"}
            </p>
            <h2 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.8rem)]">
              {bestseller
                ? "Yang paling sering dipesan"
                : "Yang baru masuk katalog"}
            </h2>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">
              {bestseller
                ? "Diurutkan dari jumlah unit yang benar-benar tercatat di pesanan."
                : "Enam produk aktif yang paling baru ditambahkan."}
            </p>
          </div>
          <Link
            href={bestseller ? "/produk?urut=laris" : "/produk"}
            className="link-underline text-[12px] font-medium text-ink-soft"
          >
            Lihat semua
          </Link>
        </div>

        <Reveal delay={120}>
          <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <div key={product.id}>
                <ProductCard product={product} preload={index === 0} />
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mt-24 bg-moss text-paper">
        <div className="wrap grid gap-14 py-20 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow text-paper/55">Cara toko bekerja</p>
            <h2 className="display mt-5 text-[clamp(2rem,4.4vw,3.4rem)]">
              Dari pesanan
              <br />
              sampai paket.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/70">
              Toko ini dijalankan manual. Tidak ada status yang berubah sendiri.
              Yang tampil di sini adalah yang benar-benar tercatat di pesanan.
            </p>
            <Link
              href="/kebijakan"
              className="btn mt-9 border-paper/40 text-paper hover:border-paper hover:bg-paper hover:text-ink"
            >
              Baca kebijakan toko
            </Link>
          </div>

          <Reveal delay={160}>
            <ol className="border-t border-paper/15">
              {process.map((item, index) => (
                <li
                  key={item.title}
                  className="grid grid-cols-[auto_1fr] gap-6 border-b border-paper/15 py-7"
                >
                  <span className="display text-3xl text-paper/35">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-[13px] font-medium">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-paper/70">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="wrap mt-20">
        <div className="grid gap-8 border border-line p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div>
            <p className="eyebrow">Sebelum memesan</p>
            <h2 className="display mt-3 text-[clamp(1.8rem,3vw,2.6rem)]">
              Masih ragu soal bahan atau ukuran?
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              Sebutkan nama produknya, lalu tanya lewat WhatsApp. Pesan dibalas
              manual oleh admin. Pertanyaan yang sering muncul sudah dirangkum di
              FAQ.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={await whatsappLink(
                "Halo, saya mau tanya soal bahan atau ukuran produk di Toko Kita.",
              )}
              target="_blank"
              rel="noreferrer"
              className="btn btn-solid"
            >
              Tanya lewat WhatsApp
            </a>
            <Link href="/faq" className="link-underline text-[12px] font-medium text-ink-soft">
              Baca FAQ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

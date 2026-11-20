import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Product3D } from "@/components/product-3d";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { prisma } from "@/lib/db";
import { formatIDR } from "@/lib/format";
import { store, whatsappLink } from "@/lib/store";

const principles = [
  {
    title: "Bahan yang bisa dilacak",
    body: "Kami sebut asal kayu, jenis kain, dan nama bengkelnya. Kalau kami tidak tahu asalnya, produk itu tidak masuk katalog.",
  },
  {
    title: "Jumlah kecil, bukan massal",
    body: "Tiap produk dibuat dalam batch 5–20 unit. Kalau habis, kami menjahit lagi — bukan mengganti bahan dengan yang lebih murah.",
  },
  {
    title: "Bisa diperbaiki",
    body: "Jahitan tas, fitting lampu, dan lapisan rotan bisa kami perbaiki. Kirim balik, kami kerjakan tanpa biaya jasa.",
  },
];

export default async function HomePage() {
  const [products, categories, productCount] = await Promise.all([
    prisma.product.findMany({
      where: { status: "active" },
      include: { images: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "asc" },
      take: 6,
    }),
    prisma.category.findMany({
      orderBy: { position: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.count({ where: { status: "active" } }),
  ]);

  const hero = products[0];
  const heroImage = hero?.images[0];

  return (
    <>
      <section className="wrap pt-10 md:pt-16">
        <div className="grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-clay" />
              {store.city} — sejak {store.established}
            </p>

            <h1 className="display mt-6 text-[clamp(2.7rem,5.2vw,4.3rem)]">
              Benda harian,
              <br />
              dipakai{" "}
              <span className="italic text-clay">bertahun-tahun</span>.
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

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Produk aktif
                </dt>
                <dd className="display mt-1 text-2xl">{productCount}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Bengkel mitra
                </dt>
                <dd className="display mt-1 text-2xl">6</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Proses pesanan
                </dt>
                <dd className="display mt-1 text-2xl">1–2 hari</dd>
              </div>
            </dl>
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Sedang di meja kami
                </p>
                <p className="mt-2 text-sm font-medium leading-snug">{hero.name}</p>
                <p className="mt-1 text-xs text-muted">{hero.tagline}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[13px] tabular-nums">
                    {formatIDR(hero.price)}
                  </span>
                  <Link
                    href={`/produk/${hero.slug}`}
                    className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-clay"
                  >
                    Lihat
                    <ArrowUpRight size={12} />
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
            className="link-underline text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft"
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
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-clay">
                    0{index + 1}
                  </span>
                  <h2 className="display mt-3 text-2xl transition-colors group-hover:text-clay">
                    {category.name}
                  </h2>
                  <p className="mt-2 max-w-[26ch] text-[13px] leading-relaxed text-muted">
                    {category.blurb}
                  </p>
                </div>
                <span className="mt-6 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  {category._count.products} produk
                  <ArrowUpRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="wrap mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="eyebrow">Pilihan bulan ini</p>
            <h2 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.8rem)]">
              Yang paling sering dipesan
            </h2>
          </div>
          <Link
            href="/produk?urut=laris"
            className="link-underline text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft"
          >
            Lihat semua
          </Link>
        </div>

        <Reveal delay={120}>
          <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <div key={product.id} className={index === 1 ? "lg:mt-20" : undefined}>
                <ProductCard product={product} preload={index === 0} />
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mt-24 bg-moss text-paper">
        <div className="wrap grid gap-14 py-20 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow text-paper/55">Cara kami bekerja</p>
            <h2 className="display mt-5 text-[clamp(2rem,4.4vw,3.4rem)]">
              Tiga hal yang
              <br />
              tidak kami tawar.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/70">
              {store.name} dimulai dari satu meja kerja di {store.city}. Kami
              tidak punya gudang besar, jadi setiap barang dipilih satu per satu
              dan diuji sebelum masuk katalog.
            </p>
            <Link
              href="/tentang"
              className="btn mt-9 border-paper/40 text-paper hover:border-paper hover:bg-paper hover:text-ink"
            >
              Cerita lengkapnya
            </Link>
          </div>

          <Reveal delay={160}>
            <ol className="border-t border-paper/15">
              {principles.map((item, index) => (
                <li
                  key={item.title}
                  className="grid grid-cols-[auto_1fr] gap-6 border-b border-paper/15 py-7"
                >
                  <span className="display text-3xl text-paper/35">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em]">
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
            <p className="eyebrow">Surat bulanan</p>
            <h2 className="display mt-3 text-[clamp(1.8rem,3vw,2.6rem)]">
              Cerita dari bengkel, tanpa spam.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              Satu surat per bulan: produk baru, catatan bahan, dan jadwal bengkel
              buka untuk umum. Kami tidak menjual alamat email ke siapa pun.
            </p>
          </div>
          <a
            href={whatsappLink("Halo, saya mau ikut surat bulanan Toko Kita.")}
            target="_blank"
            rel="noreferrer"
            className="btn btn-solid"
          >
            Ikut lewat WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}

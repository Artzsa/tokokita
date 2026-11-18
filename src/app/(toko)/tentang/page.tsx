import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Toko Kita bekerja dengan enam bengkel kecil di Jawa. Batch kecil, bahan yang bisa dilacak, dan barang yang bisa diperbaiki.",
};

const timeline = [
  {
    year: "2024",
    title: "Mulai dari satu meja",
    body: "Kami membeli 20 gelas stoneware dari bengkel di Kasongan untuk dipakai sendiri. Setengahnya diminta teman, sisanya dijual lewat pesan pribadi.",
  },
  {
    year: "2025",
    title: "Belajar soal bahan",
    body: "Tiga bulan kami habiskan untuk mencoba kanvas, linen, dan kulit. Banyak yang gagal: kanvas terlalu tipis, kulit mudah retak. Yang lolos uji baru masuk daftar.",
  },
  {
    year: "2026",
    title: "Buka katalog",
    body: `Sekarang ada ${store.name} dengan katalog kecil, dikelola dari ${store.city}. Kami masih memilih barang satu per satu.`,
  },
];

export default async function AboutPage() {
  const [productCount, categoryCount] = await Promise.all([
    prisma.product.count({ where: { status: "active" } }),
    prisma.category.count(),
  ]);

  return (
    <div>
      <section className="wrap pt-12 md:pt-16">
        <p className="eyebrow flex items-center gap-3">
          <span className="h-px w-8 bg-clay" />
          Tentang kami
        </p>
        <h1 className="display mt-6 max-w-4xl text-[clamp(2.6rem,6.4vw,5rem)]">
          Kami tidak buru-buru,
          <br />
          dan itu <span className="italic text-clay">disengaja</span>.
        </h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <div className="space-y-6 text-[15px] leading-relaxed text-ink-soft">
            <p className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[64px] first-letter:leading-[0.85] first-letter:text-clay">
              {store.name} dimulai karena kami lelah membeli barang yang terlihat
              bagus di foto lalu rusak setelah tiga bulan. Bukan karena kami ingin
              membangun merek besar. Kami hanya ingin tahu siapa yang membuat
              barang kami, dari bahan apa, dan bagaimana memperbaikinya kalau
              rusak.
            </p>
            <p>
              Sekarang kami bekerja dengan enam bengkel kecil di Jawa Tengah dan
              Yogyakarta. Semuanya usaha keluarga dengan 2–7 orang. Kami datang
              langsung, mencoba sampel, dan menolak yang tidak lolos uji pakai
              minimal dua minggu.
            </p>
            <p>
              Karena itu katalog kami kecil: {productCount} produk dalam{" "}
              {categoryCount} kategori. Kalau sesuatu habis, kami menunggu batch
              berikutnya daripada mengganti bahan dengan yang lebih murah.
            </p>
          </div>

          <div className="tk-hero-media relative aspect-[4/5] overflow-hidden bg-paper-deep">
            <Image
              src="/uploads/seed/lampu-meja-kaleng.svg"
              alt="Lampu meja kaleng di meja kerja Toko Kita"
              fill
              preload
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mt-20 bg-moss text-paper">
        <div className="wrap py-20">
          <blockquote className="mx-auto max-w-4xl">
            <p className="display text-[clamp(1.8rem,4vw,3.2rem)] leading-[1.12]">
              “Barang yang baik tidak perlu diganti setiap tahun. Ia hanya perlu
              dirawat, dan kadang diperbaiki.”
            </p>
            <footer className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/60">
              Catatan dari bengkel, {store.city}
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="wrap mt-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="eyebrow">Perjalanan</p>
            <h2 className="display mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)]">
              Tiga tahun,
              <br />
              tiga pelajaran.
            </h2>
          </div>

          <ol className="border-t border-line">
            {timeline.map((item) => (
              <li
                key={item.year}
                className="grid gap-4 border-b border-line py-7 sm:grid-cols-[auto_1fr] sm:gap-10"
              >
                <span className="display text-3xl text-clay">{item.year}</span>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap mt-20">
        <div className="grid gap-8 border border-line p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div>
            <p className="eyebrow">Bengkel buka untuk umum</p>
            <h2 className="display mt-3 text-[clamp(1.8rem,3vw,2.6rem)]">
              Mampir lihat prosesnya.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              Setiap Sabtu pagi kami buka meja kerja di {store.city}. Bisa lihat
              bahan langsung, coba barang, atau bawa tas yang perlu dijahit ulang.
            </p>
          </div>
          <Link href="/kontak" className="btn btn-solid">
            Atur kunjungan
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}

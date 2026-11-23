import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Toko Kita adalah toko online kecil yang dijalankan sendiri. Katalog pendek, stok dihitung dari sisa, dan pesanan dikonfirmasi manual.",
};

const steps = [
  {
    title: "Pilih barang dan checkout",
    body: "Tidak perlu membuat akun. Isi nama, nomor WhatsApp, dan alamat. Setelah pesanan dibuat, nomor pesanan langsung muncul.",
  },
  {
    title: "Pembayaran dicek manual",
    body: "Transfer bank atau COD. Admin membuka pesanan, mencocokkan pembayaran, lalu mengubah status. Tidak ada pembayaran otomatis di situs.",
  },
  {
    title: "Pesanan disiapkan dan dikirim",
    body: "Stok berkurang saat pesanan dibuat. Nomor pesanan bisa dibuka lagi kapan saja untuk melihat status dan rincian.",
  },
];

export default async function AboutPage() {
  const [productCount, categoryCount, settings] = await Promise.all([
    prisma.product.count({ where: { status: "active" } }),
    prisma.category.count(),
    getSettings(),
  ]);

  return (
    <div>
      <section className="wrap pt-12 md:pt-16">
        <p className="eyebrow">Tentang kami</p>
        <h1 className="display mt-6 max-w-4xl text-[clamp(2.6rem,6.4vw,5rem)]">
          Toko kecil,
          <br />
          katalog <span className="italic text-clay">pendek</span>.
        </h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <div className="space-y-6 text-[15px] leading-relaxed text-ink-soft">
            <p className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[64px] first-letter:leading-[0.85] first-letter:text-clay">
              {store.name} dijalankan sendiri
              {settings.storeCity ? ` dari ${settings.storeCity}` : ""}.
              Katalognya sengaja pendek: perkakas rumah, tas, dan alat kerja yang
              stoknya bisa dihitung satu per satu.
            </p>
            <p>
              Tidak ada akun pelanggan dan tidak ada pembayaran otomatis. Setiap
              pesanan dibuka oleh admin, dicek pembayarannya, lalu statusnya
              diubah sesuai keadaan sebenarnya.
            </p>
            <p>
              Saat ini ada {productCount} produk aktif dalam {categoryCount}{" "}
              kategori. Kalau stok habis, tombol beli dimatikan sampai stok diisi
              lagi.
            </p>
          </div>

          <div className="tk-hero-media relative aspect-[4/5] overflow-hidden bg-paper-deep">
            <Image
              src="/uploads/seed/lampu-meja-kaleng.jpg"
              alt="Lampu meja kaleng"
              fill
              preload
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="wrap mt-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="eyebrow">Cara kerja</p>
            <h2 className="display mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)]">
              Dari pesanan
              <br />
              sampai paket.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              Semua langkah di bawah ini benar-benar dijalankan di panel admin.
              Tidak ada status yang berubah sendiri.
            </p>
          </div>

          <ol className="border-t border-line">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="grid gap-4 border-b border-line py-7 sm:grid-cols-[auto_1fr] sm:gap-10"
              >
                <span className="display text-3xl text-clay">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-[15px] font-medium">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                    {step.body}
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
            <p className="eyebrow">Sebelum memesan</p>
            <h2 className="display mt-3 text-[clamp(1.8rem,3vw,2.6rem)]">
              Ada yang mau ditanyakan?
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              Soal bahan, ukuran, atau isi paket, tanya lewat WhatsApp. Pertanyaan
              yang sering muncul sudah dirangkum di FAQ.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/kontak" className="btn btn-solid">
              Buka halaman kontak
            </Link>
            <Link href="/faq" className="btn btn-ghost">
              Baca FAQ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

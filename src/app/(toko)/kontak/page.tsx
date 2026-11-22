import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Wrench } from "lucide-react";
import { getStoreWhatsapp } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi Toko Kita lewat WhatsApp untuk pertanyaan produk, pesanan, atau pembayaran.",
};

const topics = [
  {
    title: "Soal pesanan",
    body: "Sebutkan nomor pesanan. Tanpa nomor itu, kami harus mencari dari nama dan tanggal, yang bisa memakan waktu.",
  },
  {
    title: "Stok dan bahan",
    body: "Sebutkan nama produk yang kamu lihat. Kalau stok habis, kami bisa bilang apakah akan diisi lagi.",
  },
  {
    title: "Pembayaran",
    body: "Untuk transfer atau COD, sertakan nomor pesanan dan bukti transfer kalau ada. Admin mencocokkan secara manual.",
  },
  {
    title: "Pesanan jumlah besar",
    body: "Belum ada program grosir resmi. Untuk jumlah besar, tanya dulu supaya ketersediaan stok bisa dicek.",
  },
];

export default async function ContactPage() {
  const whatsapp = await getStoreWhatsapp();
  const waLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Halo Toko Kita, saya mau tanya.")}`;
  const repairLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Halo, saya mau tanya soal barang yang bermasalah.")}`;

  return (
    <div className="wrap pt-12 md:pt-16">
      <header>
        <p className="eyebrow">Kontak</p>
        <h1 className="display mt-6 max-w-3xl text-[clamp(2.6rem,6vw,4.6rem)]">
          Mari bicara,
          <br />
          tidak harus beli.
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          WhatsApp adalah jalur tercepat. Pesan dibaca manual, jadi balasannya
          tidak selalu langsung. Sebutkan nomor pesanan kalau ada.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div className="border-t border-line">
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start gap-5 border-b border-line py-6"
          >
            <MessageCircle
              size={20}
              strokeWidth={1.5}
              className="mt-1 shrink-0 text-clay"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                WhatsApp
              </p>
              <p className="mt-1 text-lg transition-colors group-hover:text-clay">
                +{whatsapp}
              </p>
              <p className="mt-1 text-xs text-muted">
                Nomor ini juga dipakai bot untuk membalas pelanggan yang pernah
                checkout.
              </p>
            </div>
          </a>

          <div className="flex items-start gap-5 border-b border-line py-6">
            <MessageCircle
              size={20}
              strokeWidth={1.5}
              className="mt-1 shrink-0 text-muted"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Sebelum mengirim pesan
              </p>
              <p className="mt-1 max-w-sm text-[14px] leading-relaxed text-ink-soft">
                Untuk pertanyaan yang sudah umum, cek{" "}
                <Link href="/faq" className="link-underline text-clay">
                  halaman FAQ
                </Link>{" "}
                dan{" "}
                <Link href="/kebijakan" className="link-underline text-clay">
                  kebijakan toko
                </Link>
                . Jawabannya mungkin sudah ada di sana.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-5 border-b border-line py-6">
            <MessageCircle
              size={20}
              strokeWidth={1.5}
              className="mt-1 shrink-0 text-muted"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Jam balasan
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
                Tidak ada janji jam balasan tetap. Pesanan tetap bisa masuk 24 jam
                lewat situs.
              </p>
            </div>
          </div>
        </div>

        <aside className="self-start border border-line bg-paper-deep/40 p-7">
          <Wrench size={22} strokeWidth={1.4} className="text-clay" />
          <h2 className="display mt-4 text-2xl">Ada barang bermasalah?</h2>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            Belum ada layanan perbaikan resmi. Kirim foto bagian yang bermasalah
            dan nomor pesanan, lalu kami cek apakah masih bisa ditangani.
          </p>
          <a
            href={repairLink}
            target="_blank"
            rel="noreferrer"
            className="btn btn-solid mt-6 w-full"
          >
            Kirim foto barang
          </a>
          <p className="mt-4 text-[11px] leading-relaxed text-muted">
            Jangan kirim barang kembali sebelum ada konfirmasi.
          </p>
        </aside>
      </div>

      <section className="mt-20">
        <div className="flex items-end justify-between border-b border-line pb-4">
          <h2 className="display text-[clamp(1.8rem,3.2vw,2.6rem)]">
            Urusan tertentu
          </h2>
          <p className="eyebrow hidden sm:block">Empat jalur</p>
        </div>
        <div className="grid sm:grid-cols-2">
          {topics.map((topic, index) => (
            <div
              key={topic.title}
              className="border-b border-line py-7 sm:odd:border-r sm:odd:pr-8 sm:even:pl-8"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-clay">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-[15px] font-medium">{topic.title}</h3>
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">
                {topic.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

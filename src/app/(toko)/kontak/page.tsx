import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Wrench } from "lucide-react";
import { store } from "@/lib/store";
import { getStoreWhatsapp, whatsappLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi Toko Kita lewat WhatsApp atau email. Kami balas di jam kerja, Senin–Sabtu.",
};

const topics = [
  {
    title: "Grosir & pesanan kantor",
    body: "Minimal 20 unit untuk satu model. Kami bisa cetak kartu ucapan dan kemasan terpisah. Beri waktu 2–3 minggu.",
  },
  {
    title: "Perbaikan",
    body: "Jahitan tas lepas, fitting lampu longgar, atau rotan patah? Kirim foto lewat WhatsApp. Biaya jasa kami hapus, biaya kirim bolak-balik ditanggung pemilik.",
  },
  {
    title: "Kolaborasi",
    body: "Kami terbuka untuk proyek kecil dengan kafe, toko buku, atau studio. Kirim brief singkat — kami balas kalau cocok.",
  },
  {
    title: "Komplain",
    body: "Barang rusak saat kirim atau tidak sesuai? Laporkan dalam 3 hari dengan foto. Kami ganti atau kembalikan uang, tanpa perdebatan panjang.",
  },
];

export default async function ContactPage() {
  const whatsapp = await getStoreWhatsapp();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    store.address,
  )}`;

  return (
    <div className="wrap pt-12 md:pt-16">
      <header>
        <p className="eyebrow flex items-center gap-3">
          <span className="h-px w-8 bg-clay" />
          Kontak
        </p>
        <h1 className="display mt-6 max-w-3xl text-[clamp(2.6rem,6vw,4.6rem)]">
          Mari bicara,
          <br />
          tidak harus beli.
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Kami orangnya sedikit, jadi balasan bisa agak lambat di luar jam kerja.
          WhatsApp paling cepat. Sebutkan nomor pesanan kalau ada.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div className="border-t border-line">
          <a
            href={await whatsappLink("Halo Toko Kita, saya mau tanya.")}
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                WhatsApp
              </p>
              <p className="mt-1 text-lg transition-colors group-hover:text-clay">
                +{whatsapp}
              </p>
              <p className="mt-1 text-xs text-muted">
                Paling cepat. Biasanya dibalas dalam 2 jam kerja.
              </p>
            </div>
          </a>

          <a
            href={`mailto:${store.email}`}
            className="group flex items-start gap-5 border-b border-line py-6"
          >
            <Mail
              size={20}
              strokeWidth={1.5}
              className="mt-1 shrink-0 text-clay"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Email
              </p>
              <p className="mt-1 text-lg transition-colors group-hover:text-clay">
                {store.email}
              </p>
              <p className="mt-1 text-xs text-muted">
                Untuk faktur, kerja sama, atau lampiran besar.
              </p>
            </div>
          </a>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start gap-5 border-b border-line py-6"
          >
            <MapPin
              size={20}
              strokeWidth={1.5}
              className="mt-1 shrink-0 text-clay"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Bengkel
              </p>
              <p className="mt-1 max-w-xs text-lg leading-snug transition-colors group-hover:text-clay">
                {store.address}
              </p>
              <p className="mt-1 text-xs text-muted">
                Buka Sabtu 09.00–13.00. Di luar itu, janjian dulu.
              </p>
            </div>
          </a>

          <div className="flex items-start gap-5 border-b border-line py-6">
            <Clock
              size={20}
              strokeWidth={1.5}
              className="mt-1 shrink-0 text-clay"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Jam balasan
              </p>
              <p className="mt-1 text-lg">{store.hours}</p>
              <p className="mt-1 text-xs text-muted">
                Pesanan tetap bisa masuk 24 jam lewat situs.
              </p>
            </div>
          </div>
        </div>

        <aside className="self-start border border-line bg-paper-deep/40 p-7">
          <Wrench size={22} strokeWidth={1.4} className="text-clay" />
          <h2 className="display mt-4 text-2xl">Bawa yang rusak.</h2>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            Kami menyimpan sisa bahan dari setiap batch. Jahitan tas yang lepas
            atau lapisan rotan yang menganga biasanya bisa kami perbaiki dalam
            satu sore.
          </p>
          <a
            href={await whatsappLink(
              "Halo, saya mau tanya soal perbaikan barang Toko Kita.",
            )}
            target="_blank"
            rel="noreferrer"
            className="btn btn-solid mt-6 w-full"
          >
            Kirim foto kerusakan
          </a>
          <p className="mt-4 text-[11px] leading-relaxed text-muted">
            Sertakan foto bagian yang rusak dan ukuran barang. Kami akan bilang
            bisa atau tidak sebelum kamu kirim.
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
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-clay">
                0{index + 1}
              </span>
              <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.1em]">
                {topic.title}
              </h3>
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

import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Plus } from "lucide-react";
import { store } from "@/lib/store";
import { whatsappLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Pertanyaan umum",
  description:
    "Pengiriman, pembayaran, penukaran, dan perawatan barang Toko Kita.",
};

const groups = [
  {
    title: "Pesanan & pengiriman",
    items: [
      {
        q: "Berapa lama pesanan diproses?",
        a: "Barang yang ada stoknya diproses 1–2 hari kerja, lalu diserahkan ke kurir. Untuk produk preorder, waktu pembuatan 2–3 minggu dan selalu kami tulis di halaman produk.",
      },
      {
        q: "Bisa bayar di tempat (COD)?",
        a: "Bisa untuk beberapa wilayah di Jawa. Kalau alamatmu di luar jangkauan kurir COD, kami ubah ke transfer dan kabari lewat WhatsApp sebelum mengirim.",
      },
      {
        q: "Bisa kirim ke luar Indonesia?",
        a: "Bisa, tapi ongkir dihitung manual. Kirim alamat lengkap lewat WhatsApp, kami balas dengan biaya dan estimasi waktu.",
      },
      {
        q: "Bisa ambil sendiri di bengkel?",
        a: `Bisa. Tulis "ambil di bengkel" di catatan checkout, lalu atur waktu lewat WhatsApp. Alamat: ${store.address}.`,
      },
    ],
  },
  {
    title: "Barang & perawatan",
    items: [
      {
        q: "Apakah foto di katalog foto asli?",
        a: "Belum. Foto di katalog adalah foto stok berlisensi CC0/public domain yang dipakai sementara supaya bentuk barang bisa dibayangkan. Foto asli tiap produk sedang kami siapkan dan akan menggantikan foto stok tanpa mengubah harga.",
      },
      {
        q: "Kenapa warna bisa berbeda dari gambar?",
        a: "Sebagian barang dibuat manual, jadi warna dan tekstur tiap unit bisa sedikit berbeda. Perbedaan layar juga berpengaruh. Kami anggap itu bagian dari barang buatan tangan, bukan cacat.",
      },
      {
        q: "Bagaimana merawat linen dan kanvas?",
        a: "Cuci tangan dengan air dingin dan sabun lembut, lalu keringkan di tempat teduh. Jangan pakai mesin pengering atau pemutih. Linen akan makin lembut setelah 3–4 kali cuci.",
      },
      {
        q: "Bisa pesan ukuran khusus?",
        a: "Untuk sarung bantal dan nampan, kadang bisa. Kirim ukuran yang diinginkan; kami cek ketersediaan bahan dan harga sebelum menerima pesanan.",
      },
    ],
  },
  {
    title: "Penukaran & perbaikan",
    items: [
      {
        q: "Barang rusak saat dikirim, bagaimana?",
        a: "Laporkan dalam 3 hari setelah diterima dengan foto kemasan dan barang. Kami kirim unit pengganti atau kembalikan uang, termasuk ongkir.",
      },
      {
        q: "Bisa tukar ukuran atau warna?",
        a: "Selama pesanan belum diserahkan ke kurir, bisa kami ubah. Setelah diterima, penukaran berlaku maksimal 3 hari dan barang belum dipakai.",
      },
      {
        q: "Apakah ada garansi perbaikan?",
        a: "Jahitan dan fitting kami tanggung selama 6 bulan. Biaya jasa tidak dipungut; biaya kirim bolak-balik ditanggung pemilik barang.",
      },
    ],
  },
];

export default async function FaqPage() {
  return (
    <div className="wrap pt-12 md:pt-16">
      <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <header className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-clay" />
            Pertanyaan umum
          </p>
          <h1 className="display mt-6 text-[clamp(2.4rem,5vw,3.8rem)]">
            Hal yang
            <br />
            sering ditanya.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
            Kalau jawabannya belum ada di sini, tanya langsung. Kami tidak memakai
            bot balasan.
          </p>
          <a
            href={await whatsappLink("Halo Toko Kita, saya mau tanya sesuatu.")}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline mt-7"
          >
            <MessageCircle size={15} />
            Tanya via WhatsApp
          </a>
        </header>

        <div className="space-y-12">
          {groups.map((group) => (
            <section key={group.title}>
              <h2 className="eyebrow border-b border-line pb-3">{group.title}</h2>
              <div>
                {group.items.map((item) => (
                  <details key={item.q} className="group border-b border-line">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5">
                      <span className="text-[15px] font-medium leading-snug">
                        {item.q}
                      </span>
                      <Plus
                        size={16}
                        className="mt-1 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45"
                      />
                    </summary>
                    <p className="max-w-2xl pb-6 text-[14px] leading-relaxed text-ink-soft">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <div className="border border-line bg-paper-deep/40 p-6">
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Masih bingung memilih ukuran atau bahan?{" "}
              <Link href="/kontak" className="link-underline text-clay">
                Hubungi kami
              </Link>{" "}
              — kami biasanya bisa menyarankan berdasarkan pemakaianmu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

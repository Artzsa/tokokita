import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Plus } from "lucide-react";
import { formatIDR } from "@/lib/format";
import { store } from "@/lib/store";
import { whatsappLink } from "@/lib/contact";
import { bankIsReady, qrisIsReady } from "@/lib/business";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Pertanyaan umum",
  description:
    "Cara memesan, pembayaran, pengiriman, stok, dan bot WhatsApp Toko Kita.",
};

function getGroups(bankReady: boolean, qrisReady: boolean) {
  const transferHelp = bankReady
    ? "Untuk transfer, nomor rekening tampil di halaman pesanan setelah checkout."
    : "Untuk transfer, minta nomor rekening lewat WhatsApp setelah pesanan dibuat.";
  const qrisHelp = qrisReady
    ? " Untuk QRIS, QR tampil di halaman pesanan dan hanya dibuka 10 menit."
    : "";

  return [
  {
    title: "Pesanan",
    items: [
      {
        q: "Bagaimana cara memesan?",
        a: "Pilih produk, masukkan ke keranjang, lalu isi nama, nomor WhatsApp, dan alamat di halaman checkout. Setelah pesanan dibuat, kamu akan melihat nomor pesanan dan langkah pembayaran.",
      },
      {
        q: "Apakah perlu membuat akun?",
        a: "Tidak. Checkout berjalan tanpa akun. Simpan tautan halaman pesanan yang muncul setelah checkout supaya kamu bisa membukanya lagi.",
      },
      {
        q: "Bagaimana cara melihat status pesanan?",
        a: "Buka halaman pesanan yang kamu simpan setelah checkout. Status di halaman itu diubah manual oleh admin, jadi yang tampil adalah status terakhir yang dicatat.",
      },
      {
        q: "Bisa bayar di tempat (COD)?",
        a: `Bisa. Pilih COD di checkout. ${transferHelp}${qrisHelp}`,
      },
    ],
  },
  {
    title: "Pembayaran & pengiriman",
    items: [
      {
        q: "Metode pembayaran apa saja yang diterima?",
        a: qrisReady
          ? "Transfer bank, QRIS, dan COD. QRIS menampilkan nominal pesanan dan hanya dibuka 10 menit. Tidak ada pembayaran kartu atau cicilan di situs ini. Admin mencocokkan pembayaran secara manual."
          : "Transfer bank dan COD. Tidak ada pembayaran kartu atau cicilan di situs ini. Admin mencocokkan pembayaran secara manual.",
      },
      {
        q: "Berapa ongkos kirim?",
        a: `Ongkir tetap ${formatIDR(store.flatShipping)} per pesanan. Pesanan dengan subtotal di atas ${formatIDR(store.freeShippingThreshold)} tidak dikenakan ongkir.`,
      },
      {
        q: "Berapa lama pesanan diproses?",
        a: "Pesanan diproses manual satu per satu. Waktu proses tergantung jumlah pesanan yang masuk. Status di halaman pesanan berubah setelah admin mengubahnya, dan kabar penting dikirim lewat WhatsApp.",
      },
      {
        q: "Bisa ambil sendiri di toko?",
        a: "Opsi ambil sendiri belum ada di checkout. Kalau kamu butuh, tanya dulu lewat WhatsApp sebelum membayar supaya bisa diatur.",
      },
    ],
  },
  {
    title: "Barang & stok",
    items: [
      {
        q: "Apakah foto di katalog foto asli?",
        a: "Belum. Foto katalog masih memakai foto stok berlisensi CC0/public domain supaya bentuk barang bisa dibayangkan. Foto asli tiap produk akan menggantikannya tanpa mengubah harga.",
      },
      {
        q: "Kenapa jumlah stok berubah saat saya memesan?",
        a: "Stok berkurang saat pesanan dibuat, bukan saat pembayaran dikonfirmasi. Kalau pesanan dibatalkan, stok dikembalikan oleh admin. Jumlah yang tampil di halaman produk berasal dari data stok yang tersimpan.",
      },
      {
        q: "Barang yang saya mau sedang habis, bagaimana?",
        a: "Tombol beli dimatikan selama stok kosong. Tanya lewat WhatsApp kalau mau tahu kapan stok diisi lagi. Kami tidak menerima pembayaran untuk barang yang belum ada.",
      },
      {
        q: "Bisa pesan ukuran atau warna khusus?",
        a: "Belum. Katalog hanya berisi produk yang sudah tercatat stoknya. Kalau ada kebutuhan khusus, tanya dulu lewat WhatsApp sebelum memesan.",
      },
    ],
  },
  {
    title: "Bot WhatsApp & bantuan",
    items: [
      {
        q: "Apakah pesan WhatsApp saya dibalas bot?",
        a: "Bot hanya membalas nomor yang pernah checkout. Nomor lain tidak diproses. Bot juga hanya mengirim rincian pesanan kalau nomor pengirim cocok dengan nomor pemesan.",
      },
      {
        q: "Barang bermasalah, apa yang harus saya lakukan?",
        a: "Kirim nomor pesanan dan foto barang lewat WhatsApp. Belum ada formulir pengembalian otomatis, jadi setiap kasus dicek manual. Jangan kirim barang kembali sebelum ada konfirmasi.",
      },
      {
        q: "Apakah ada garansi perbaikan?",
        a: "Belum ada program garansi resmi. Kalau barang bermasalah, tanyakan lewat WhatsApp. Kami akan bilang apakah bisa diperbaiki dan apa yang dibutuhkan.",
      },
      {
        q: "Data saya dipakai untuk apa?",
        a: "Nama, kontak, dan alamat dipakai untuk memproses pesanan dan mengirim kabar soal pesanan itu. Tidak ada pelacak iklan dan tidak ada newsletter. Data disimpan di server toko sendiri.",
      },
    ],
  },
  ];
}

export default async function FaqPage() {
  const [settings, waLink] = await Promise.all([
    getSettings(),
    whatsappLink("Halo Toko Kita, saya mau tanya sesuatu."),
  ]);
  const groups = getGroups(bankIsReady(settings), qrisIsReady(settings));

  return (
    <div className="wrap pt-12 md:pt-16">
      <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <header className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">Pertanyaan umum</p>
          <h1 className="display mt-6 text-[clamp(2.4rem,5vw,3.8rem)]">
            Hal yang
            <br />
            sering ditanya.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
            Jawaban di bawah mengikuti apa yang benar-benar dilakukan toko saat
            ini. Kalau belum ada jawabannya, tanya langsung.
          </p>
          <a
            href={waLink}
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
              </Link>
              . Sebutkan produk yang kamu lihat supaya jawabannya lebih cepat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

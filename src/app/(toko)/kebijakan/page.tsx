import type { Metadata } from "next";
import { formatIDR } from "@/lib/format";
import { store } from "@/lib/store";
import { getStoreWhatsapp, whatsappLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Kebijakan",
  description:
    "Kebijakan pembayaran, pengiriman, pembatalan, dan privasi Toko Kita.",
};

const summary = [
  {
    label: "Ongkir",
    value: `${formatIDR(store.flatShipping)} · gratis di atas ${formatIDR(store.freeShippingThreshold)}`,
  },
  { label: "Pembayaran", value: "Transfer bank atau COD" },
  { label: "Proses", value: "Dicek manual oleh admin" },
  { label: "Pesanan pending", value: "Dibatalkan setelah 3 hari" },
];

const sections = [
  {
    id: "pembayaran",
    title: "Pembayaran",
    body: [
      "Pembayaran dilakukan lewat transfer bank atau bayar di tempat (COD). Situs ini belum menerima kartu kredit, cicilan, atau pembayaran otomatis.",
      "Instruksi transfer dikirim lewat WhatsApp setelah pesanan dicek. Admin mencocokkan pembayaran secara manual, lalu mengubah status pesanan.",
      "Pesanan yang belum dibayar atau dikonfirmasi selama 3 hari dibatalkan otomatis. Stok dari pesanan itu dilepas kembali ke katalog.",
      "Nominal yang harus dibayar tercantum di halaman pesanan. Tidak ada biaya tambahan di luar harga barang dan ongkir.",
    ],
  },
  {
    id: "pengiriman",
    title: "Pengiriman",
    body: [
      `Ongkir tetap ${formatIDR(store.flatShipping)} per pesanan. Pesanan dengan subtotal di atas ${formatIDR(store.freeShippingThreshold)} mendapat gratis ongkir.`,
      "Pesanan disiapkan manual satu per satu. Waktu proses tergantung jumlah pesanan yang masuk. Status di halaman pesanan berubah setelah admin mencatatnya.",
      "Situs ini belum terhubung ke layanan pelacak kurir. Kalau butuh nomor resi atau kabar pengiriman, tanya lewat WhatsApp dengan menyertakan nomor pesanan.",
      "Opsi ambil sendiri belum tersedia di checkout. Kalau kamu butuh, tanya dulu lewat WhatsApp sebelum membayar.",
    ],
  },
  {
    id: "pengembalian",
    title: "Pengembalian",
    body: [
      "Belum ada formulir pengembalian otomatis. Kalau barang rusak saat dikirim atau tidak sesuai pesanan, hubungi kami lewat WhatsApp dengan nomor pesanan dan foto barang.",
      "Setiap kasus dicek manual. Jangan mengirim barang kembali sebelum ada konfirmasi, supaya paket tidak hilang atau tertukar.",
      "Keputusan penggantian atau pengembalian dana dikonfirmasi lewat WhatsApp setelah barang dan kemasan diperiksa.",
    ],
  },
  {
    id: "garansi",
    title: "Perbaikan",
    body: [
      "Belum ada program garansi resmi. Kalau barang bermasalah setelah dipakai, tanyakan lewat WhatsApp. Kami akan bilang apakah bisa diperbaiki dan apa yang dibutuhkan.",
      "Biaya perbaikan, bahan, dan pengiriman dibicarakan langsung sebelum barang dikirim ke kami. Tidak ada biaya yang muncul tanpa persetujuan.",
    ],
  },
  {
    id: "privasi",
    title: "Privasi",
    body: [
      "Nama, nomor WhatsApp, email, dan alamat dipakai untuk memproses pesanan dan mengirim kabar terkait pesanan itu.",
      "Data disimpan di server toko sendiri. Tidak ada pelacak iklan, tidak ada newsletter, dan data tidak dijual ke pihak lain.",
      "Halaman pesanan bisa dibuka lewat tautan yang kamu simpan. Siapa pun yang memegang tautan itu bisa melihat rincian pesanan, jadi jangan membagikannya sembarangan.",
    ],
  },
  {
    id: "perawatan",
    title: "Perawatan",
    body: [
      "Ikuti petunjuk yang disertakan pada barang. Untuk kain, cuci tangan dengan air dingin dan sabun lembut, lalu keringkan di tempat teduh.",
      "Untuk kayu, lap dengan kain lembap dan jangan direndam. Untuk logam, keringkan setelah terkena air supaya tidak berkarat.",
      "Kalau ragu soal cara membersihkan bahan tertentu, tanya lewat WhatsApp sebelum mencoba.",
    ],
  },
];

export default async function PolicyPage() {
  const [whatsapp, waLink] = await Promise.all([
    getStoreWhatsapp(),
    whatsappLink("Halo Toko Kita, saya mau tanya soal kebijakan toko."),
  ]);

  return (
    <div className="wrap pt-12 md:pt-16">
      <header className="max-w-3xl">
        <p className="eyebrow">Kebijakan toko</p>
        <h1 className="display mt-6 text-[clamp(2.6rem,5.6vw,4.4rem)]">
          Aturan main,
          <br />
          ditulis jelas.
        </h1>
        <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
          Isi halaman ini mengikuti fitur yang benar-benar ada di toko. Kalau ada
          yang terasa tidak jelas, tanyakan sebelum memesan.
        </p>
        <p className="mt-4 text-[11px] text-muted">
          Diperbarui 22 November 2026
        </p>
      </header>

      <dl className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="bg-paper p-5">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              {item.label}
            </dt>
            <dd className="mt-2 text-[13px] leading-snug">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-16 grid gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:gap-20">
        <nav aria-label="Daftar kebijakan" className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">Isi halaman</p>
          <ul className="mt-4 space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="link-underline text-[13px] text-ink-soft hover:text-ink"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="space-y-14">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-40">
              <h2 className="display text-[clamp(1.6rem,2.6vw,2.1rem)]">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 border-t border-line pt-5">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="max-w-2xl text-[14px] leading-relaxed text-ink-soft"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <div className="bg-paper-deep/50 p-6">
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Ada pertanyaan soal kebijakan ini?{" "}
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="link-underline text-clay"
              >
                WhatsApp +{whatsapp}
              </a>
              . Sebutkan nomor pesanan kalau pertanyaannya soal pesanan tertentu.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

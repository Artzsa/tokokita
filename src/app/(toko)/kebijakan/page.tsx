import type { Metadata } from "next";
import { formatIDR } from "@/lib/format";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: "Kebijakan",
  description:
    "Kebijakan pembayaran, pengiriman, pengembalian, dan privasi Toko Kita.",
};

const summary = [
  { label: "Ongkir", value: `${formatIDR(store.flatShipping)} · gratis di atas ${formatIDR(store.freeShippingThreshold)}` },
  { label: "Proses", value: "1–2 hari kerja" },
  { label: "Penukaran", value: "3 hari setelah diterima" },
  { label: "Garansi jahitan", value: "6 bulan" },
];

const sections = [
  {
    id: "pembayaran",
    title: "Pembayaran",
    body: [
      "Pembayaran dilakukan lewat transfer bank atau bayar di tempat (COD) untuk wilayah yang terjangkau kurir. Kami belum menerima kartu kredit atau pembayaran cicilan.",
      "Pesanan transfer disimpan 3 hari. Kalau belum ada pembayaran atau konfirmasi dalam waktu itu, pesanan dibatalkan otomatis dan stok dilepas kembali.",
      "Nominal yang harus dibayar tercantum di halaman pesanan setelah checkout. Tidak ada biaya tambahan di luar ongkir.",
    ],
  },
  {
    id: "pengiriman",
    title: "Pengiriman",
    body: [
      `Semua pesanan dikirim dari ${store.city} memakai kurir rekanan. Waktu proses 1–2 hari kerja, di luar Minggu dan hari libur nasional.`,
      `Ongkir tetap ${formatIDR(store.flatShipping)} untuk seluruh Indonesia. Pesanan di atas ${formatIDR(store.freeShippingThreshold)} mendapat gratis ongkir.`,
      "Setiap paket memakai kemasan kertas, serat kayu, dan pita kertas. Kami tidak memakai bubble wrap plastik kecuali barang sangat rapuh — itu pun dari stok daur ulang.",
      "Nomor resi dikirim lewat WhatsApp setelah paket diserahkan ke kurir. Kalau 2 hari kerja belum ada kabar, hubungi kami.",
      "Pengambilan langsung di bengkel bisa dilakukan tanpa ongkir, dengan janji waktu lewat WhatsApp.",
    ],
  },
  {
    id: "pengembalian",
    title: "Pengembalian & penukaran",
    body: [
      "Kalau barang rusak saat pengiriman atau tidak sesuai pesanan, laporkan dalam 3 hari setelah diterima dengan foto kemasan dan barang. Kami kirim pengganti atau kembalikan uang penuh, termasuk ongkir.",
      "Penukaran ukuran atau warna berlaku maksimal 3 hari setelah barang diterima, dengan syarat barang belum dipakai, label masih ada, dan kemasan utuh.",
      "Produk yang dibuat khusus (ukuran atau warna pesanan) tidak dapat ditukar, kecuali ada cacat produksi.",
      "Biaya kirim untuk penukaran karena alasan pribadi ditanggung pembeli. Untuk cacat produksi, kami yang menanggung.",
    ],
  },
  {
    id: "garansi",
    title: "Garansi perbaikan",
    body: [
      "Jahitan tas, sambungan rotan, dan fitting lampu kami tanggung selama 6 bulan sejak barang diterima. Biaya jasa tidak dipungut.",
      "Biaya pengiriman bolak-balik untuk perbaikan ditanggung pemilik barang, kecuali kerusakan terjadi saat pengiriman awal.",
      "Kerusakan akibat pemakaian kasar, air, atau panas berlebih di luar petunjuk perawatan tidak termasuk garansi. Kami tetap bisa memperbaikinya dengan biaya bahan.",
    ],
  },
  {
    id: "privasi",
    title: "Privasi",
    body: [
      "Kami menyimpan nama, email, nomor WhatsApp, dan alamat hanya untuk memproses pesanan dan mengirim kabar terkait pesanan itu.",
      "Alamat email tidak dijual atau dibagikan ke pihak ketiga. Kalau kamu ikut surat bulanan, kamu bisa berhenti kapan saja lewat tautan di email atau dengan memberi tahu kami.",
      "Data pesanan disimpan selama 2 tahun untuk keperluan garansi dan pembukuan, lalu dihapus.",
      "Kami tidak memasang pelacak iklan di situs ini. Statistik kunjungan, kalau ada, bersifat agregat dan tanpa identitas.",
    ],
  },
  {
    id: "perawatan",
    title: "Perawatan",
    body: [
      "Linen dan kanvas: cuci tangan dengan air dingin dan sabun lembut, keringkan di tempat teduh. Jangan pakai mesin pengering, pemutih, atau setrika panas langsung.",
      "Kayu: lap dengan kain lembap, jangan direndam. Olesi minyak kayu food-grade setiap 3 bulan agar tidak pecah.",
      "Stoneware: boleh dicuci mesin. Hindari perubahan suhu mendadak, misalnya menuang air mendidih ke gelas yang baru keluar dari kulkas.",
      "Rotan: bersihkan dengan kuas kering. Jangan disimpan di tempat lembap terlalu lama karena bisa berjamur.",
      "Kulit: lap dengan kain kering. Hindari air, panas langsung, dan sinar matahari berkepanjangan.",
    ],
  },
];

export default function PolicyPage() {
  return (
    <div className="wrap pt-12 md:pt-16">
      <header className="max-w-3xl">
        <p className="eyebrow flex items-center gap-3">
          <span className="h-px w-8 bg-clay" />
          Kebijakan toko
        </p>
        <h1 className="display mt-6 text-[clamp(2.6rem,5.6vw,4.4rem)]">
          Aturan main,
          <br />
          ditulis jelas.
        </h1>
        <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
          Kami berusaha tidak menyembunyikan syarat di huruf kecil. Kalau ada yang
          terasa tidak adil, beri tahu kami — kebijakan ini bisa berubah.
        </p>
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted">
          Diperbarui 1 November 2026
        </p>
      </header>

      <dl className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="bg-paper p-5">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
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
              Ada pertanyaan soal kebijakan ini? Email{" "}
              <a href={`mailto:${store.email}`} className="link-underline text-clay">
                {store.email}
              </a>{" "}
              atau WhatsApp +{store.whatsapp}. Kami balas di jam kerja.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

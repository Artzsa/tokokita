import Link from "next/link";
import { store, whatsappLink } from "@/lib/store";

const columns = [
  {
    title: "Belanja",
    links: [
      { label: "Semua produk", href: "/produk" },
      { label: "Rumah", href: "/produk?kategori=rumah" },
      { label: "Tas & bawa", href: "/produk?kategori=tas-bawa" },
      { label: "Meja kerja", href: "/produk?kategori=meja-kerja" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Pertanyaan umum", href: "/faq" },
      { label: "Pengiriman", href: "/kebijakan#pengiriman" },
      { label: "Pengembalian", href: "/kebijakan#pengembalian" },
      { label: "Hubungi kami", href: "/kontak" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-paper-deep">
      <div className="wrap grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <p className="eyebrow">
            Sejak {store.established} — {store.city}
          </p>
          <p className="display mt-4 text-4xl">{store.name}</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
            {store.tagline} Dibuat dan dipilih sendiri, dijual dengan harga yang
            bisa kami pertanggungjawabkan.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="eyebrow">{column.title}</p>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-underline text-sm text-ink-soft hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="eyebrow">Mampir</p>
          <ul className="mt-5 space-y-3 text-sm text-ink-soft">
            <li>{store.address}</li>
            <li>{store.hours}</li>
            <li>
              <a
                href={whatsappLink("Halo Toko Kita, saya mau tanya produk.")}
                target="_blank"
                rel="noreferrer"
                className="link-underline"
              >
                WhatsApp
              </a>{" "}
              · {store.instagram}
            </li>
            <li>
              <a href={`mailto:${store.email}`} className="link-underline">
                {store.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="wrap flex flex-col gap-3 border-t border-line py-6 text-[11px] uppercase tracking-[0.14em] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {store.legalName}. Semua harga dalam Rupiah.
        </p>
        <p>Transfer bank · COD · QRIS menyusul</p>
      </div>
    </footer>
  );
}

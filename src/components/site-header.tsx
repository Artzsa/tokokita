import Link from "next/link";
import { Search } from "lucide-react";
import { getCartCount } from "@/lib/cart";
import { store } from "@/lib/store";

const ticker = [
  "Gratis ongkir di atas Rp500.000",
  "Dikirim dari Yogyakarta",
  "Pesanan diproses 1–2 hari kerja",
  "Bayar transfer atau COD",
];

const links = [
  { href: "/produk", label: "Katalog" },
  { href: "/tentang", label: "Tentang" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontak", label: "Kontak" },
];

export async function SiteHeader() {
  const count = await getCartCount();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="overflow-hidden bg-ink text-paper">
        <div className="tk-marquee-track">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 items-center py-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
              aria-hidden={copy === 1}
            >
              {ticker.map((item) => (
                <span key={item} className="flex items-center">
                  <span className="px-6">{item}</span>
                  <span className="text-clay">/</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="wrap flex h-[74px] items-center justify-between gap-6">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="display text-[27px] leading-none transition-colors group-hover:text-clay">
            {store.name}
          </span>
          <span className="hidden text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:block">
            est. {store.established}
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Navigasi utama">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link-underline text-[13px] font-medium tracking-wide text-ink-soft hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/produk"
            aria-label="Cari produk"
            className="hidden size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink sm:flex"
          >
            <Search size={18} strokeWidth={1.6} />
          </Link>
          <Link
            href="/keranjang"
            className="group flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-ink"
          >
            <span className="hidden sm:inline">Keranjang</span>
            <span className="sm:hidden">Tas</span>
            <span className="flex size-5 items-center justify-center rounded-full bg-ink text-[10px] text-paper group-hover:bg-clay">
              {count}
            </span>
          </Link>
        </div>
      </div>

      <div className="border-t border-line md:hidden">
        <nav className="wrap flex items-center gap-6 overflow-x-auto py-3" aria-label="Navigasi seluler">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

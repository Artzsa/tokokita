import Link from "next/link";
import { Search } from "lucide-react";
import { CartCountBadge } from "@/components/cart-count-badge";
import { getCartCount } from "@/lib/cart";
import { store } from "@/lib/store";

const ticker = [
  "Checkout tanpa akun",
  "Bayar transfer atau COD",
  "Konfirmasi lewat WhatsApp",
  "Gratis ongkir di atas Rp 500.000",
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
      <div className="tk-ticker bg-ink text-paper">
        <div className="wrap flex flex-wrap items-center gap-x-5 gap-y-1 py-2 text-[11px] font-medium tracking-[0.04em]">
          {ticker.map((item, index) => (
            <span key={item} className="flex items-center gap-5">
              {item}
              {index < ticker.length - 1 ? (
                <span className="text-clay/70" aria-hidden="true">
                  /
                </span>
              ) : null}
            </span>
          ))}
        </div>
      </div>

      <div className="wrap flex h-[74px] items-center justify-between gap-6">
        <Link href="/" className="group">
          <span className="display text-[27px] leading-none transition-colors group-hover:text-clay">
            {store.name}
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
            className="group flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-[12px] font-medium transition-colors hover:border-ink"
          >
            <span className="hidden sm:inline">Keranjang</span>
            <span className="sm:hidden">Tas</span>
            <CartCountBadge key={count} count={count} />
          </Link>
        </div>
      </div>

      <div className="border-t border-line md:hidden">
        <nav className="wrap flex items-center gap-6 overflow-x-auto py-3" aria-label="Navigasi seluler">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap py-1 text-[12px] font-medium text-ink-soft"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

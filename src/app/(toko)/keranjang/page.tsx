import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShoppingBag } from "lucide-react";
import { CartLineRow } from "@/components/cart-line-row";
import { CartSummary } from "@/components/cart-summary";
import { emptyCartAction } from "@/lib/actions/cart-actions";
import { getCart } from "@/lib/cart";
import { formatIDR } from "@/lib/format";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: "Keranjang",
  description: "Periksa barang pilihanmu sebelum checkout.",
};

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string }>;
}) {
  const [cart, params] = await Promise.all([getCart(), searchParams]);
  const justAdded = params.added === "1";
  const remainingForFreeShipping = Math.max(
    store.freeShippingThreshold - cart.subtotal,
    0,
  );

  return (
    <div className="wrap pt-12 md:pt-16">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <p className="eyebrow">Langkah 1 dari 2</p>
          <h1 className="display mt-4 text-[clamp(2.4rem,5vw,3.8rem)]">
            Keranjang
          </h1>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {cart.count} barang
        </p>
      </header>

      {justAdded ? (
        <div className="mt-6 flex items-center gap-3 border border-moss/30 bg-moss/5 px-4 py-3 text-[13px] text-moss">
          <Check size={16} />
          Barang sudah masuk keranjang. Kamu bisa lanjut belanja atau langsung
          checkout.
        </div>
      ) : null}

      {cart.lines.length === 0 ? (
        <div className="mt-16 flex flex-col items-start gap-6 border border-dashed border-line px-8 py-16">
          <ShoppingBag size={30} strokeWidth={1.2} className="text-clay" />
          <div>
            <h2 className="display text-2xl">Keranjang masih kosong.</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Belum ada yang dipilih. Mulai dari katalog; jumlah yang tersedia
              tampil di tiap produk.
            </p>
          </div>
          <Link href="/produk" className="btn btn-solid">
            Buka katalog
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <p className="eyebrow">Barang pilihan</p>
              <Link
                href="/produk"
                className="link-underline text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft"
              >
                Tambah barang
              </Link>
            </div>

            {cart.lines.map((line) => (
              <CartLineRow key={line.key} line={line} />
            ))}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <Link href="/produk" className="btn btn-ghost">
                Lanjut belanja
              </Link>
              <form action={emptyCartAction}>
                <button
                  type="submit"
                  className="text-[11px] uppercase tracking-[0.12em] text-muted underline-offset-4 hover:text-clay hover:underline"
                >
                  Kosongkan keranjang
                </button>
              </form>
            </div>
          </div>

          <div className="lg:sticky lg:top-32 lg:self-start">
            <CartSummary
              cart={cart}
              note={
                store.flatShipping === 0 ? (
                  <>Ongkir sedang gratis untuk semua pesanan.</>
                ) : remainingForFreeShipping > 0 ? (
                  <>
                    Tambah {formatIDR(remainingForFreeShipping)} lagi untuk
                    gratis ongkir.
                  </>
                ) : (
                  <>Pesanan ini sudah dapat gratis ongkir.</>
                )
              }
            >
              <Link href="/checkout" className="btn btn-solid w-full">
                Lanjut ke checkout
                <ArrowRight size={14} />
              </Link>
            </CartSummary>

            <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
              Pembayaran transfer bank, QRIS, atau COD. Tidak ada biaya
              tersembunyi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

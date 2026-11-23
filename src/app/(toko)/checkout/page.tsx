import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShieldCheck, Truck } from "lucide-react";
import { CartSummary } from "@/components/cart-summary";
import { CheckoutForm } from "@/components/checkout-form";
import { getCart } from "@/lib/cart";
import { formatIDR } from "@/lib/format";
import { bankIsReady, qrisIsReady } from "@/lib/business";
import { getSettings } from "@/lib/settings";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Isi alamat pengiriman dan buat pesanan.",
};

const reassurances = [
  {
    icon: Truck,
    title: "Ongkir dihitung sekali",
    body: `Tetap ${formatIDR(store.flatShipping)}, gratis di atas ${formatIDR(store.freeShippingThreshold)}.`,
  },
  {
    icon: Package,
    title: "Checkout tanpa akun",
    body: "Isi data penerima, pesanan langsung dibuat dan mendapat nomor.",
  },
  {
    icon: ShieldCheck,
    title: "Pembayaran dikonfirmasi manual",
    body: "Pilih transfer, QRIS, atau COD. Instruksi dan QR tampil di halaman pesanan setelah checkout.",
  },
];

export default async function CheckoutPage() {
  const [cart, settings] = await Promise.all([getCart(), getSettings()]);
  if (cart.lines.length === 0) redirect("/keranjang");
  const bankReady = bankIsReady(settings);
  const qrisReady = qrisIsReady(settings);

  return (
    <div className="wrap pt-12 md:pt-16">
      <header className="border-b border-line pb-8">
        <p className="eyebrow">Langkah 2 dari 2</p>
        <h1 className="display mt-4 text-[clamp(2.4rem,5vw,3.8rem)]">
          Checkout
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
          Isi data penerima. Setelah pesanan dibuat, kamu akan melihat nomor
          pesanan dan langkah pembayaran. Tidak ada pembayaran online di
          halaman ini.
        </p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
        <CheckoutForm bankReady={bankReady} qrisReady={qrisReady} />

        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="border border-line border-b-0">
            {cart.lines.map((line) => (
              <div
                key={line.key}
                className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-3 text-[13px]"
              >
                <span className="min-w-0">
                  <span className="tabular-nums text-muted">{line.qty}×</span>{" "}
                  {line.name}
                  {line.variantLabel ? (
                    <span className="text-muted"> · {line.variantLabel}</span>
                  ) : null}
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatIDR(line.lineTotal)}
                </span>
              </div>
            ))}
          </div>

          <CartSummary
            cart={cart}
            note={
              <>
                Instruksi transfer dan QRIS tampil di halaman pesanan. Pesanan
                disimpan selama 3 hari sebelum stok dilepas kembali.
              </>
            }
          />

          <ul className="mt-8 space-y-5">
            {reassurances.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex gap-3">
                  <Icon
                    size={17}
                    strokeWidth={1.5}
                    className="mt-0.5 shrink-0 text-clay"
                  />
                  <div>
                    <p className="text-[13px] font-medium">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <Link
            href="/kebijakan"
            className="link-underline mt-8 inline-block text-[12px] font-medium text-ink-soft"
          >
            Baca kebijakan pengiriman
          </Link>
        </div>
      </div>
    </div>
  );
}

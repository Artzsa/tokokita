import type { Product, ProductVariant } from "@prisma/client";
import { addToCartAction } from "@/lib/actions/cart-actions";
import { formatIDR } from "@/lib/format";
import { store } from "@/lib/store";

export function AddToCartForm({
  product,
  variants,
}: {
  product: Product;
  variants: ProductVariant[];
}) {
  const soldOut =
    product.stock <= 0 && variants.every((variant) => variant.stock <= 0);
  const firstAvailable = variants.find((variant) => variant.stock > 0);
  const defaultVariantId = firstAvailable?.id ?? variants[0]?.id ?? "";

  return (
    <form action={addToCartAction} className="mt-8 space-y-6">
      <input type="hidden" name="productId" value={product.id} />

      {variants.length > 0 ? (
        <fieldset>
          <legend className="label">Pilih varian</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <label key={variant.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="variantId"
                  value={variant.id}
                  defaultChecked={variant.id === defaultVariantId}
                  disabled={variant.stock <= 0}
                  className="peer sr-only"
                />
                <span className="flex items-center gap-2 border border-line px-4 py-2.5 text-[13px] transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-clay peer-disabled:cursor-not-allowed peer-disabled:opacity-40">
                  {variant.label}
                  {variant.stock <= 0 ? (
                    <span className="text-[10px] uppercase tracking-[0.1em]">
                      habis
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="qty" className="label">
            Jumlah
          </label>
          <input
            id="qty"
            name="qty"
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            defaultValue={1}
            className="input w-24 text-center"
          />
        </div>
        <button
          type="submit"
          disabled={soldOut}
          className="btn btn-solid min-w-56 flex-1"
        >
          {soldOut ? "Stok habis" : "Tambah ke keranjang"}
        </button>
      </div>

      <p className="text-xs leading-relaxed text-muted">
        Ongkir dihitung di checkout. Gratis untuk pesanan di atas{" "}
        {formatIDR(store.freeShippingThreshold)}. Pembayaran transfer bank,
        QRIS, atau COD.
      </p>
    </form>
  );
}

import type { Cart } from "@/lib/cart";
import { formatIDR } from "@/lib/format";

export function CartSummary({
  cart,
  children,
  note,
}: {
  cart: Cart;
  children?: React.ReactNode;
  note?: React.ReactNode;
}) {
  return (
    <aside className="border border-line bg-paper-deep/40 p-6">
      <p className="eyebrow">Ringkasan</p>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">Subtotal ({cart.count} barang)</dt>
          <dd className="tabular-nums">{formatIDR(cart.subtotal)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">Ongkir</dt>
          <dd className="tabular-nums">
            {cart.shipping === 0 ? "Gratis" : formatIDR(cart.shipping)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line pt-4">
        <span className="text-sm font-medium">Total</span>
        <span className="display text-2xl tabular-nums">
          {formatIDR(cart.total)}
        </span>
      </div>

      {note ? <div className="mt-5 text-xs leading-relaxed text-muted">{note}</div> : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </aside>
  );
}

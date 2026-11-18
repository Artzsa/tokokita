import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import type { CartLine } from "@/lib/cart";
import {
  changeCartQtyAction,
  removeCartItemAction,
} from "@/lib/actions/cart-actions";
import { formatIDR } from "@/lib/format";

export function CartLineRow({ line }: { line: CartLine }) {
  return (
    <div className="flex gap-5 border-t border-line py-6">
      <Link
        href={`/produk/${line.slug}`}
        className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-paper-deep sm:w-28"
      >
        <Image
          src={line.image}
          alt={line.name}
          fill
          sizes="112px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:flex-row">
        <div className="min-w-0">
          <Link
            href={`/produk/${line.slug}`}
            className="text-[15px] font-medium leading-snug hover:text-clay"
          >
            {line.name}
          </Link>
          <p className="mt-1 text-xs text-muted">
            {line.variantLabel ? line.variantLabel : "Satu pilihan"}
          </p>
          <p className="mt-2 text-[13px] tabular-nums text-ink-soft">
            {formatIDR(line.unitPrice)} / barang
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center border border-line">
              <form action={changeCartQtyAction}>
                <input type="hidden" name="key" value={line.key} />
                <button
                  type="submit"
                  name="delta"
                  value="-1"
                  aria-label={`Kurangi jumlah ${line.name}`}
                  className="grid size-9 place-items-center text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
                >
                  <Minus size={14} />
                </button>
              </form>
              <span className="w-9 text-center text-[13px] tabular-nums">
                {line.qty}
              </span>
              <form action={changeCartQtyAction}>
                <input type="hidden" name="key" value={line.key} />
                <button
                  type="submit"
                  name="delta"
                  value="1"
                  disabled={line.qty >= line.maxQty}
                  aria-label={`Tambah jumlah ${line.name}`}
                  className="grid size-9 place-items-center text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </form>
            </div>

            <form action={removeCartItemAction}>
              <input type="hidden" name="key" value={line.key} />
              <button
                type="submit"
                className="flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-clay"
              >
                <X size={12} />
                Hapus
              </button>
            </form>
          </div>
        </div>

        <p className="shrink-0 text-right text-[14px] font-medium tabular-nums">
          {formatIDR(line.lineTotal)}
        </p>
      </div>
    </div>
  );
}

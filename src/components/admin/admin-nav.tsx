"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Tags,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";

const items = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard, exact: true },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingCart },
  { href: "/admin/kategori", label: "Kategori", icon: Tags },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export function AdminNav({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col border-b border-white/10 bg-ink text-paper md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:border-white/10">
      <div className="flex items-baseline justify-between gap-4 px-5 pb-4 pt-6 md:block md:px-6">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-paper/50">
            Panel toko
          </p>
          <p className="display mt-1 text-2xl text-paper">Toko Kita</p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-paper/50 hover:text-paper md:mt-4"
        >
          Lihat toko
          <ExternalLink size={11} />
        </Link>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:mt-4 md:flex-col md:px-3">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-3 rounded-hair px-3 py-2.5 text-[13px] transition-colors ${
                active
                  ? "bg-clay text-paper"
                  : "text-paper/70 hover:bg-white/5 hover:text-paper"
              }`}
            >
              <Icon size={16} strokeWidth={1.6} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-white/10 p-6 md:block">
        <p className="text-[13px] font-medium text-paper">{name}</p>
        <p className="mt-0.5 truncate text-[11px] text-paper/50">{email}</p>
        <form action={logoutAction} className="mt-4">
          <button
            type="submit"
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper/50 transition-colors hover:text-clay"
          >
            <LogOut size={13} />
            Keluar
          </button>
        </form>
      </div>

      <div className="flex border-t border-white/10 px-5 py-3 md:hidden">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper/50"
          >
            <LogOut size={13} />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}

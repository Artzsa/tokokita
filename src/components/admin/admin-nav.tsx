"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  X,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";

const groups = [
  {
    label: "Toko",
    items: [
      { href: "/admin", label: "Ringkasan", icon: LayoutDashboard, exact: true },
      { href: "/admin/produk", label: "Produk", icon: Package },
      { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingCart },
      { href: "/admin/kategori", label: "Kategori", icon: Tags },
    ],
  },
  {
    label: "Sistem",
    items: [
      { href: "/admin/rules", label: "Rules WA", icon: MessageSquareText },
      { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  pendingCount,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof Package;
  active: boolean;
  pendingCount: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`relative flex min-h-11 items-center gap-3 rounded-hair py-2.5 pl-4 pr-3 text-[13px] transition-colors ${
        active
          ? "bg-white/[0.07] text-paper"
          : "text-paper/65 hover:bg-white/5 hover:text-paper"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full ${
          active ? "bg-clay" : "bg-transparent"
        }`}
      />
      <Icon size={16} strokeWidth={1.6} />
      <span>{label}</span>
      {label === "Pesanan" && pendingCount > 0 ? (
        <span className="ml-auto rounded-tag bg-clay px-2 py-0.5 text-[10px] font-semibold tabular-nums text-paper">
          {pendingCount}
        </span>
      ) : null}
    </Link>
  );
}

function PanelContent({
  name,
  email,
  pathname,
  pendingCount,
  onNavigate,
}: {
  name: string;
  email: string;
  pathname: string;
  pendingCount: number;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="px-5 pb-5 pr-14 pt-6 md:pr-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-paper/45">
          Panel toko
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <p className="display text-2xl text-paper">Toko Kita</p>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1 text-[11px] text-paper/50 hover:text-paper"
          >
            Lihat toko
            <ExternalLink size={11} />
          </Link>
        </div>
      </div>

      <nav className="flex-1 space-y-6 px-3" aria-label="Navigasi panel">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper/40">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  active={isActive(pathname, item.href, item.exact)}
                  pendingCount={pendingCount}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 p-5">
        <p className="text-[13px] font-medium text-paper">{name}</p>
        <p className="mt-0.5 truncate text-[11px] text-paper/45">{email}</p>
        <form action={logoutAction} className="mt-4">
          <button
            type="submit"
            className="flex min-h-11 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-paper/50 transition-colors hover:text-clay"
          >
            <LogOut size={13} />
            Keluar
          </button>
        </form>
      </div>
    </>
  );
}

export function AdminNav({
  name,
  email,
  pendingCount,
}: {
  name: string;
  email: string;
  pendingCount: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const firstLink = panelRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <aside className="hidden border-r border-white/10 bg-ink text-paper md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <PanelContent
          name={name}
          email={email}
          pathname={pathname}
          pendingCount={pendingCount}
        />
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-white/10 bg-ink px-5 py-3 text-paper md:hidden">
        <div className="flex items-baseline gap-3">
          <p className="display text-xl">Toko Kita</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/45">
            Panel
          </p>
        </div>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="panel-menu"
          className="flex min-h-11 items-center gap-2 rounded-hair border border-white/20 px-3 text-[12px] font-medium"
        >
          <Menu size={15} />
          Menu
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={close}
            className="absolute inset-0 bg-ink/70"
          />
          <div
            id="panel-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu panel toko"
            className="absolute inset-y-0 left-0 flex w-[min(19rem,86vw)] flex-col bg-ink text-paper shadow-2xl"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Tutup menu"
              className="absolute right-2 top-2 flex size-11 items-center justify-center text-paper/60 hover:text-paper"
            >
              <X size={18} />
            </button>
            <PanelContent
              name={name}
              email={email}
              pathname={pathname}
              pendingCount={pendingCount}
              onNavigate={close}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

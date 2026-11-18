import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/auth";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const admin = await getAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-moss p-8 text-paper lg:p-16">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-paper/60">
            Panel internal
          </p>
          <p className="display mt-3 text-3xl">{store.name}</p>
        </div>

        <div className="my-16 hidden lg:block">
          <p className="display max-w-md text-[clamp(2rem,3.4vw,3rem)] leading-[1.1]">
            “Barang yang baik tidak perlu diganti setiap tahun.”
          </p>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/50">
            Catatan dari bengkel, {store.city}
          </p>
        </div>

        <p className="text-[11px] uppercase tracking-[0.16em] text-paper/45">
          {store.address}
        </p>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-sm">
          <p className="eyebrow">Masuk</p>
          <h1 className="display mt-4 text-4xl">Panel toko</h1>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            Kelola produk, stok, dan pesanan. Sesi berakhir otomatis setelah 12
            jam.
          </p>

          <LoginForm />

          <div className="mt-8 border border-dashed border-line p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-clay">
              Akun demo
            </p>
            <p className="mt-2 font-mono text-[12px] text-ink-soft">
              admin@tokokita.test
              <br />
              tokokita123
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Ganti kata sandi dan hapus catatan ini sebelum toko online.
            </p>
          </div>

          <Link
            href="/"
            className="link-underline mt-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted"
          >
            <ArrowLeft size={13} />
            Kembali ke toko
          </Link>
        </div>
      </div>
    </div>
  );
}

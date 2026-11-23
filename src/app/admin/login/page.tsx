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
      <div className="flex flex-col justify-between bg-ink p-8 text-paper lg:p-16">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/60">
            Panel internal
          </p>
          <p className="display mt-3 text-3xl">{store.name}</p>
        </div>

        <div className="my-16 hidden lg:block">
          <p className="display max-w-md text-[clamp(2rem,3.4vw,3rem)] leading-[1.1]">
            Satu tempat untuk pesanan, stok, dan bot.
          </p>
          <p className="mt-6 max-w-sm text-[13px] leading-relaxed text-paper/60">
            Ringkasan dimulai dari pesanan yang perlu ditindaklanjuti. Produk
            dan stok diubah dari sini, dan aturan bot dibaca ulang setiap kali
            ada pesan masuk.
          </p>
        </div>

        <p className="text-[11px] text-paper/45">
          Akses khusus admin toko
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-clay">
              Setelah masuk
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Ganti kata sandi lewat Pengaturan lalu bagian Keamanan. Jangan
              biarkan kata sandi awal dipakai saat toko diakses dari perangkat
              lain.
            </p>
          </div>

          <Link
            href="/"
            className="link-underline mt-8 inline-flex items-center gap-2 text-[12px] font-medium text-muted"
          >
            <ArrowLeft size={13} />
            Kembali ke toko
          </Link>
        </div>
      </div>
    </div>
  );
}

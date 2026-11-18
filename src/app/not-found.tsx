import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="wrap flex flex-1 flex-col justify-center py-24">
        <p className="eyebrow">404 — tidak ditemukan</p>
        <h1 className="display mt-6 text-[clamp(3rem,8vw,6rem)]">
          Halaman ini
          <br />
          sudah <span className="italic text-clay">pindah</span>.
        </h1>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Mungkin tautannya salah ketik, atau produknya sudah tidak dijual. Coba
          mulai dari katalog — stok berubah setiap minggu.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/produk" className="btn btn-solid">
            Buka katalog
            <ArrowRight size={14} />
          </Link>
          <Link href="/" className="btn btn-outline">
            Kembali ke beranda
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

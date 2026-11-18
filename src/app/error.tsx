"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="wrap flex min-h-[70vh] flex-col justify-center py-24">
      <p className="eyebrow">Ada yang gagal dimuat</p>
      <h1 className="display mt-6 text-[clamp(2.6rem,6vw,4.6rem)]">
        Bukan kamu,
        <br />
        ini <span className="italic text-clay">kami</span>.
      </h1>
      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">
        Halaman gagal dimuat karena kesalahan di server. Coba muat ulang. Kalau
        tetap gagal, beri tahu kami lewat WhatsApp dengan waktu kejadiannya.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-solid">
          <RotateCcw size={14} />
          Coba lagi
        </button>
        <Link href="/" className="btn btn-outline">
          Ke beranda
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-8 font-mono text-[11px] text-muted">
          Kode kesalahan: {error.digest}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { MessageCircle, RotateCcw } from "lucide-react";

const WINDOW_MS = 10 * 60 * 1000;

function remainingLabel(ms: number) {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.ceil(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function QrisPaymentPanel({
  qrDataUrl,
  merchantName,
  orderNumber,
  amountLabel,
  whatsappHref,
}: {
  qrDataUrl: string;
  merchantName: string;
  orderNumber: string;
  amountLabel: string;
  whatsappHref: string;
}) {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let deadlineAt: number | null = null;

    const tick = () => {
      const stamp = Date.now();
      if (deadlineAt === null) deadlineAt = stamp + WINDOW_MS;
      setNow(stamp);
      setDeadline(deadlineAt);
    };

    const kickoff = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 1000);

    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(timer);
    };
  }, []);

  const remaining =
    deadline === null || now === null ? WINDOW_MS : deadline - now;
  const open = remaining > 0;

  return (
    <div className="border border-ink bg-paper p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            QRIS
          </p>
          <p className="mt-1 text-[13px] font-medium">{merchantName}</p>
        </div>
        <p
          className={`text-[12px] tabular-nums ${
            open ? "text-ink-soft" : "text-clay-deep"
          }`}
          aria-live="off"
        >
          {open ? `Sisa ${remainingLabel(remaining)}` : "QR ditutup"}
        </p>
      </div>

      {open ? (
        <>
          <div className="mt-4 flex justify-center border border-line bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`QRIS pembayaran pesanan ${orderNumber}, nominal ${amountLabel}`}
              width={220}
              height={220}
              className="h-auto w-full max-w-[220px]"
            />
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
              Jumlah
            </p>
            <p className="display mt-1 text-3xl tabular-nums">{amountLabel}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              {orderNumber}
            </p>
          </div>

          <p className="mt-4 text-[12px] leading-relaxed text-muted">
            Scan dengan aplikasi bank atau e-wallet. Nominal sudah terisi, jadi
            jangan diubah. Setelah membayar, kirim bukti lewat WhatsApp.
          </p>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="btn btn-solid mt-5 w-full"
          >
            <MessageCircle size={15} />
            Kirim bukti via WhatsApp
          </a>

          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            QR hanya ditampilkan 10 menit. Pembayaran dicek manual oleh admin,
            bukan otomatis.
          </p>
        </>
      ) : (
        <>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
            QR untuk pesanan ini sudah ditutup. Kalau kamu belum membayar,
            tampilkan lagi untuk mendapat 10 menit baru. Kalau sudah membayar,
            jangan bayar ulang — kirim bukti lewat WhatsApp.
          </p>

          <button
            type="button"
            className="btn btn-ghost mt-5 w-full"
            onClick={() => {
              const next = Date.now() + WINDOW_MS;
              setDeadline(next);
              setNow(Date.now());
            }}
          >
            <RotateCcw size={14} />
            Tampilkan QR 10 menit lagi
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="btn btn-solid mt-3 w-full"
          >
            <MessageCircle size={15} />
            Kirim bukti via WhatsApp
          </a>
        </>
      )}
    </div>
  );
}

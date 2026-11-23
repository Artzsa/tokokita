"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, ScanLine, Square, Play, KeyRound } from "lucide-react";

type BotStatus = {
  status: string;
  hasQr: boolean;
  qrVersion: string;
  pairingCode: string;
  pairNumber: string;
  running: boolean;
  method: string;
  dryRun: boolean;
};

const labels: Record<string, string> = {
  offline: "Bot mati",
  starting: "Menjalankan...",
  connecting: "Menghubungkan...",
  waiting_scan: "Menunggu scan QR",
  waiting_pair: "Menunggu kode pairing dipakai",
  connected: "WhatsApp tersambung",
  disconnected: "Koneksi putus",
};

export function BotConnectPanel() {
  const [data, setData] = useState<BotStatus | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const localNumber = data?.pairNumber?.replace(/^62/, "") ?? "";

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/bot/status", { cache: "no-store" });
      if (res.ok) setData((await res.json()) as BotStatus);
    } catch {
      // biarkan polling berikutnya
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(() => {
      void refresh();
    }, 0);
    const timer = setInterval(() => {
      void refresh();
    }, 3000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [refresh]);

  async function call(path: string, key: string) {
    setBusy(key);
    setMessage("");
    try {
      const res = await fetch(path, { method: "POST" });
      const body = await res.json();
      if (!res.ok) setMessage(body.error ?? "Gagal.");
      if (body.code) setMessage(`Kode pairing: ${body.code}`);
      await refresh();
    } catch {
      setMessage("Gagal menghubungi server.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section
      id="koneksi-whatsapp"
      className="scroll-mt-24 border border-line bg-paper p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Koneksi WhatsApp
          </h2>
          <p className="mt-2 flex items-center gap-2 text-[13px] font-medium">
            <span
              className={`inline-block size-2 rounded-full ${
                data?.status === "connected" ? "bg-moss" : "bg-clay"
              }`}
            />
            {labels[data?.status ?? ""] ?? "Memeriksa status..."}
          </p>
          {data ? (
            <p className="mt-1 text-[11px] text-muted">
              Bot {data.running ? "berjalan" : "tidak berjalan"} · metode{" "}
              {data.method === "pairing" ? "pairing" : "QR"}
              {data.dryRun ? " · mode uji" : ""}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => call("/api/bot/start", "start")}
            disabled={Boolean(busy) || data?.running}
            className="btn btn-solid"
          >
            {busy === "start" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            Jalankan bot
          </button>
          <button
            type="button"
            onClick={() => call("/api/bot/stop", "stop")}
            disabled={Boolean(busy) || !data?.running}
            className="btn btn-ghost"
          >
            <Square size={13} />
            Hentikan
          </button>
          {data?.method === "pairing" ? (
            <button
              type="button"
              onClick={() => call("/api/bot/pairing", "pairing")}
              disabled={Boolean(busy) || !data?.running}
              className="btn btn-ghost"
            >
              {busy === "pairing" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <KeyRound size={14} />
              )}
              Minta kode
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void refresh()}
            className="btn btn-ghost"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {message ? (
        <p className="mt-4 border border-line bg-paper-deep/40 px-3 py-2 text-[12px] text-ink-soft">
          {message}
        </p>
      ) : null}

      {data?.pairingCode ? (
        <div className="mt-5 border border-ink bg-ink p-5 text-paper">
          <p className="text-[10px] uppercase tracking-[0.16em] text-paper/60">
            Kode pairing
          </p>
          <p className="display mt-2 text-3xl tracking-[0.2em]">
            {data.pairingCode}
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-paper/60">
            Di HP: WhatsApp → Perangkat tertaut → Tautkan perangkat → Tautkan
            dengan nomor telepon. Pilih kode negara <strong>+62</strong>, lalu
            ketik <strong className="font-mono text-paper">{localNumber}</strong>{" "}
            (tanpa angka 62 di depan), setelah itu masukkan kode di atas.
          </p>
        </div>
      ) : null}

      {data?.hasQr ? (
        <div className="mt-5 flex flex-col items-center gap-3 border border-line bg-paper-deep/30 p-5">
          <ScanLine size={18} className="text-clay" />
          <p className="text-[12px] font-medium">Scan QR dari HP Anda</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={data?.qrVersion}
            src="/api/bot/qr"
            alt="QR code WhatsApp"
            className="size-56 bg-white p-2"
          />
          <p className="text-center text-[11px] leading-relaxed text-muted">
            WhatsApp → Perangkat tertaut → Tautkan perangkat → Scan QR ini.
            QR diganti otomatis jika kedaluwarsa.
          </p>
        </div>
      ) : null}
    </section>
  );
}

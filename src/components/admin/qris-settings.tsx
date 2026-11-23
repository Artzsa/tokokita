"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import jsQR from "jsqr";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { inspectQris } from "@/lib/qris";

type Status = {
  kind: "ok" | "error";
  message: string;
};

export function QrisSettings({ initial }: { initial: string }) {
  const [payload, setPayload] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dirty, setDirty] = useState(false);

  const info = payload.trim() ? inspectQris(payload) : null;
  const status: Status | null =
    info?.ok
      ? {
          kind: "ok",
          message: `${info.merchantName}${info.city ? ` · ${info.city}` : ""} · checksum cocok`,
        }
      : info
        ? { kind: "error", message: info.error }
        : null;

  async function readFile(file: File) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Pilih file gambar QRIS, bukan dokumen lain.");
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new Error("Ukuran gambar maksimal 8 MB.");
    }

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      bitmap.close();
      throw new Error("Browser tidak bisa membaca gambar.");
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const pixels = context.getImageData(0, 0, width, height);
    const result = jsQR(pixels.data, width, height, {
      inversionAttempts: "attemptBoth",
    });
    if (!result) {
      throw new Error(
        "QR tidak terbaca. Coba gambar yang lebih tajam, atau tempel data QRIS di kolom teks.",
      );
    }

    setPayload(result.data);
    setDirty(true);
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setUploadError("");
    try {
      await readFile(file);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Gambar gagal dibaca.",
      );
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  return (
    <div className="mt-5 space-y-4 border-t border-line pt-5">
      <div className="flex flex-wrap items-center gap-2">
        <label className="btn btn-ghost cursor-pointer">
          {busy ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Membaca gambar
            </>
          ) : (
            <>
              <ImageUp size={14} />
              Pilih gambar QRIS
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={busy}
            className="sr-only"
          />
        </label>

        {payload ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setPayload("");
              setUploadError("");
              setDirty(true);
            }}
          >
            <Trash2 size={14} />
            Hapus
          </button>
        ) : null}
      </div>

      <div>
        <label htmlFor="qrisPayload" className="label">
          Data QRIS statis
        </label>
        <textarea
          id="qrisPayload"
          value={payload}
          onChange={(event) => {
            setPayload(event.target.value);
            setDirty(true);
          }}
          onBlur={() => setDirty(true)}
          rows={3}
          spellCheck={false}
          placeholder="Tempel data QRIS di sini, atau pilih gambar QRIS di atas."
          className="input font-mono text-[11px] leading-relaxed"
        />
        <input type="hidden" name="qrisPayload" value={payload} />
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          Gambar hanya dibaca di browser. Yang disimpan cuma data QRIS-nya,
          bukan fotonya.
        </p>
      </div>

      {uploadError ? (
        <p role="alert" className="text-[12px] text-clay-deep">
          {uploadError}
        </p>
      ) : null}

      {status ? (
        <p
          role="status"
          className={`text-[12px] ${
            status.kind === "ok"
              ? "text-moss"
              : dirty
                ? "text-clay-deep"
                : "text-muted"
          }`}
        >
          {status.kind === "ok" ? "QRIS terbaca: " : "Belum bisa dipakai: "}
          {status.message}
        </p>
      ) : null}

      <div className="border border-line bg-paper-deep/30 px-4 py-3 text-[11px] leading-relaxed text-muted">
        Pakai QRIS merchant, bukan QR terima uang pribadi. QRIS merchant bisa
        discan dari GoPay, BCA, atau aplikasi lain. Setelah disimpan, pembeli
        akan melihat QR dengan nominal pesanan yang berlaku 10 menit.
      </div>
    </div>
  );
}

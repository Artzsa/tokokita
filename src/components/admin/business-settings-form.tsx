"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import {
  saveBusinessSettingsAction,
  type BusinessState,
} from "@/lib/actions/business-actions";
import type { Settings } from "@/lib/settings";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-solid">
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          Menyimpan
        </>
      ) : (
        "Simpan data toko"
      )}
    </button>
  );
}

function Field({
  id,
  label,
  hint,
  value,
  type = "text",
  wide = false,
}: {
  id: keyof Settings;
  label: string;
  hint?: string;
  value: string;
  type?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        defaultValue={value}
        className="input"
      />
      {hint ? (
        <p className="mt-1 text-[11px] leading-relaxed text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function BusinessSettingsForm({ initial }: { initial: Settings }) {
  const [state, formAction] = useActionState<BusinessState, FormData>(
    saveBusinessSettingsAction,
    {},
  );
  const values = state.values ?? {};
  const val = (key: keyof Settings) => values[key] ?? String(initial[key] ?? "");

  return (
    <form key={state.nonce ?? 0} action={formAction} className="space-y-6">
      {state.error ? (
        <p
          role="alert"
          className="border border-clay/30 bg-clay/5 px-4 py-3 text-[13px] text-clay-deep"
        >
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="flex items-center gap-2 border border-moss/30 bg-moss/5 px-4 py-3 text-[13px] text-moss">
          <Check size={15} />
          Data toko tersimpan.
        </p>
      ) : null}

      <section className="border border-line bg-paper p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Identitas toko
        </h2>
        <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-muted">
          Kosongkan bagian yang belum ada. Bagian kosong tidak ditampilkan di
          toko, jadi tidak ada alamat atau jam buka palsu.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field
            id="storeCity"
            label="Kota atau asal"
            value={val("storeCity")}
            hint="Contoh: Yogyakarta. Hanya tampil kalau diisi."
          />
          <Field
            id="storeEmail"
            label="Email"
            type="email"
            value={val("storeEmail")}
          />
          <Field
            id="storeInstagram"
            label="Instagram"
            value={val("storeInstagram")}
            hint="Tulis dengan atau tanpa @."
          />
          <Field
            id="storeHours"
            label="Jam buka atau jam balasan"
            value={val("storeHours")}
          />
          <Field
            id="storeAddress"
            label="Alamat"
            value={val("storeAddress")}
            wide
          />
        </div>
      </section>

      <section className="border border-line bg-paper p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Pembayaran transfer
        </h2>
        <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-muted">
          Kalau tiga kolom ini diisi, nomor rekening tampil di halaman pesanan
          yang belum dibayar. Kalau dikosongkan, pembeli diminta menghubungi
          WhatsApp untuk meminta nomor rekening.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field id="bankName" label="Nama bank" value={val("bankName")} />
          <Field
            id="bankNumber"
            label="Nomor rekening"
            value={val("bankNumber")}
          />
          <Field
            id="bankHolder"
            label="Nama pemilik rekening"
            value={val("bankHolder")}
            wide
          />
        </div>
      </section>


      <p className="text-[11px] leading-relaxed text-muted">
        Ongkir dan batas gratis ongkir masih diatur di{" "}
        <code className="bg-paper-deep px-1">src/lib/store.ts</code> karena
        nilainya dipakai saat checkout. Hubungi pengembang kalau ingin
        mengubahnya dari panel.
      </p>

      <SubmitButton />
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import {
  saveSettingsAction,
  type SettingsState,
} from "@/lib/actions/settings-actions";
import type { Settings } from "@/lib/settings";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-solid w-full">
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          Menyimpan
        </>
      ) : (
        "Simpan pengaturan"
      )}
    </button>
  );
}

function Checkbox({
  name,
  label,
  hint,
  checked,
}: {
  name: string;
  label: string;
  hint: string;
  checked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border-b border-line py-4 last:border-b-0">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="mt-1 size-4 accent-[var(--color-clay)]"
      />
      <span>
        <span className="block text-[13px] font-medium">{label}</span>
        <span className="mt-1 block text-[11px] leading-relaxed text-muted">
          {hint}
        </span>
      </span>
    </label>
  );
}

export function SettingsForm({ initial }: { initial: Settings }) {
  const [state, formAction] = useActionState<SettingsState, FormData>(
    saveSettingsAction,
    {},
  );
  const values = state.values ?? {};
  const val = (key: keyof Settings, fallback: string | number | boolean) =>
    values[key] ?? String(fallback);
  const checked = (key: keyof Settings, fallback: boolean) =>
    values[key] === undefined ? fallback : values[key] === "true";

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
          Pengaturan tersimpan. Bot akan membacanya pada siklus berikutnya.
        </p>
      ) : null}

      <section className="border border-line bg-paper p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          Notifikasi WhatsApp
        </h2>
        <div className="mt-2">
          <Checkbox
            name="notificationsEnabled"
            label="Aktifkan notifikasi"
            hint="Kirim pesan WA otomatis ke pembeli saat status pesanan berubah."
            checked={checked("notificationsEnabled", initial.notificationsEnabled)}
          />
          <Checkbox
            name="dryRun"
            label="Mode uji (dry run)"
            hint="Bot tidak menyambung WhatsApp; pesan hanya ditandai terkirim di database."
            checked={checked("dryRun", initial.dryRun)}
          />
        </div>
      </section>

      <section className="border border-line bg-paper p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          Pesan awal
        </h2>
        <div className="mt-5">
          <label htmlFor="welcomeMessage" className="label">
            Pesan pembuka
          </label>
          <textarea
            id="welcomeMessage"
            name="welcomeMessage"
            rows={4}
            defaultValue={String(val("welcomeMessage", initial.welcomeMessage))}
            placeholder="Halo! Saya bot Toko Kita..."
            className="input"
          />
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            Dipakai saat pertanyaan tidak cocok dengan aturan mana pun. Maksimal 500
            karakter.
          </p>
        </div>
      </section>

      <section className="border border-line bg-paper p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          Koneksi bot
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="loginMethod" className="label">
              Metode login
            </label>
            <select
              id="loginMethod"
              name="loginMethod"
              defaultValue={String(val("loginMethod", initial.loginMethod))}
              className="input"
            >
              <option value="qr">QR code (disarankan)</option>
              <option value="pairing">Pairing code (eksperimental)</option>
            </select>
          </div>
          <div>
            <label htmlFor="pairNumber" className="label">
              Nomor pairing
            </label>
            <input
              id="pairNumber"
              name="pairNumber"
              defaultValue={String(val("pairNumber", initial.pairNumber))}
              placeholder="6281234567890"
              className="input"
            />
            <p className="mt-1 text-[11px] text-muted">Wajib hanya untuk pairing code.</p>
          </div>
          <div className="sm:col-span-2 rounded-hair border border-line bg-paper-deep/40 p-4">
            <p className="text-[11px] leading-relaxed text-muted">
              Bot sekarang membalas chat pribadi siapa pun dengan aturan di{" "}
              <Link href="/admin/rules" className="link-underline text-clay">
                Rules WA
              </Link>
              . Nomor WhatsApp toko dan notifikasi diambil dari field{" "}
              <strong>Nomor pairing</strong> di atas, jadi cukup samakan keduanya di
              sini. Detail pesanan hanya dikirim kalau nomor pengirim cocok dengan
              nomor pembeli.
            </p>
          </div>
          <div>
            <label htmlFor="pollMs" className="label">
              Interval poll outbox (ms)
            </label>
            <input
              id="pollMs"
              name="pollMs"
              inputMode="numeric"
              defaultValue={String(val("pollMs", initial.pollMs))}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="maxAttempts" className="label">
              Maksimal percobaan kirim
            </label>
            <input
              id="maxAttempts"
              name="maxAttempts"
              inputMode="numeric"
              defaultValue={String(val("maxAttempts", initial.maxAttempts))}
              className="input"
            />
          </div>
        </div>
      </section>

      <SubmitButton />
    </form>
  );
}

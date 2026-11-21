"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import {
  saveBotRuleAction,
  type BotRuleFormState,
} from "@/lib/actions/admin-actions";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-solid w-full">
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          Menyimpan
        </>
      ) : editing ? (
        "Simpan perubahan"
      ) : (
        "Tambah aturan"
      )}
    </button>
  );
}

export type BotRuleInitial = {
  id: string;
  keywords: string;
  answer: string;
  enabled: boolean;
  position: number;
};

export function BotRuleForm({ initial }: { initial?: BotRuleInitial }) {
  const [state, formAction] = useActionState<BotRuleFormState, FormData>(
    saveBotRuleAction,
    {},
  );
  const values = state.values ?? {};
  const val = (key: string, fallback?: string | number | null) =>
    values[key] ?? fallback?.toString() ?? "";
  const checked = (key: string, fallback: boolean) =>
    values[key] === undefined ? fallback : values[key] === "true";
  const editing = Boolean(initial?.id);

  return (
    <form key={state.nonce ?? 0} action={formAction} className="space-y-6">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

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
          Aturan berhasil disimpan.
        </p>
      ) : null}

      <section className="border border-line bg-paper p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          Pemicu & jawaban
        </h2>
        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="keywords" className="label">
              Kata kunci
            </label>
            <input
              id="keywords"
              name="keywords"
              required
              defaultValue={val("keywords", initial?.keywords)}
              placeholder="ongkir, kirim, ekspedisi"
              className="input"
            />
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              Pisahkan dengan koma. Bot mencari kata kunci ini di pesan pembeli
              (abaikan huruf besar/kecil).
            </p>
          </div>

          <div>
            <label htmlFor="answer" className="label">
              Jawaban
            </label>
            <textarea
              id="answer"
              name="answer"
              rows={6}
              required
              defaultValue={val("answer", initial?.answer)}
              placeholder="Jawaban yang akan dikirim ke pembeli."
              className="input"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="position" className="label">
                Urutan
              </label>
              <input
                id="position"
                name="position"
                inputMode="numeric"
                defaultValue={val("position", initial?.position ?? 0)}
                placeholder="1"
                className="input"
              />
              <p className="mt-1 text-[11px] text-muted">
                Angka lebih kecil diperiksa lebih dulu.
              </p>
            </div>
            <label className="flex cursor-pointer items-start gap-3 border border-line p-4">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={checked("enabled", initial?.enabled ?? true)}
                className="mt-1 size-4 accent-[var(--color-clay)]"
              />
              <span>
                <span className="block text-[13px] font-medium">Aktif</span>
                <span className="mt-1 block text-[11px] leading-relaxed text-muted">
                  Aturan nonaktif tidak akan dipakai bot.
                </span>
              </span>
            </label>
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <SubmitButton editing={editing} />
        <Link href="/admin/rules" className="btn btn-ghost w-full">
          Batal
        </Link>
      </div>
    </form>
  );
}

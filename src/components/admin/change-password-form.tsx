"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import {
  changePasswordAction,
  type PasswordState,
} from "@/lib/actions/password-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-ghost">
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          Menyimpan
        </>
      ) : (
        "Ganti kata sandi"
      )}
    </button>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useActionState<PasswordState, FormData>(
    changePasswordAction,
    {},
  );

  return (
    <form key={state.nonce ?? 0} action={formAction} className="space-y-5">
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
          Kata sandi berhasil diganti.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="current" className="label">
            Kata sandi saat ini
          </label>
          <input
            id="current"
            name="current"
            type="password"
            autoComplete="current-password"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="next" className="label">
            Kata sandi baru
          </label>
          <input
            id="next"
            name="next"
            type="password"
            autoComplete="new-password"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="label">
            Ulangi kata sandi baru
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            className="input"
          />
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-muted">
        Minimal 10 karakter. Setelah diganti, kata sandi lama tidak bisa dipakai
        lagi.
      </p>

      <SubmitButton />
    </form>
  );
}

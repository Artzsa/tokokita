"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/actions/auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-solid w-full">
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          Memeriksa
        </>
      ) : (
        "Masuk"
      )}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {state.error ? (
        <p
          role="alert"
          className="border border-clay/30 bg-clay/5 px-3 py-2.5 text-[13px] text-clay-deep"
        >
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.email}
          required
          className="input"
        />
      </div>

      <div>
        <label htmlFor="password" className="label">
          Kata sandi
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
        />
      </div>

      <SubmitButton />
    </form>
  );
}

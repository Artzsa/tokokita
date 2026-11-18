"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Lock } from "lucide-react";
import {
  placeOrderAction,
  type CheckoutState,
} from "@/lib/actions/checkout-actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-solid w-full">
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          Memproses pesanan
        </>
      ) : (
        "Buat pesanan"
      )}
    </button>
  );
}

function Field({
  name,
  label,
  error,
  defaultValue,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
  className,
}: {
  name: string;
  label: string;
  error?: string;
  defaultValue?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className="input"
      />
      {error ? (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CheckoutForm() {
  const [state, formAction] = useActionState<CheckoutState, FormData>(
    placeOrderAction,
    {},
  );
  const errors = state.errors ?? {};
  const values = state.values ?? {};

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state.error ? (
        <p
          role="alert"
          className="border border-clay/30 bg-clay/5 px-4 py-3 text-[13px] leading-relaxed text-clay-deep"
        >
          {state.error}
        </p>
      ) : null}

      <fieldset className="space-y-5">
        <legend className="eyebrow mb-4">Penerima</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="customerName"
            label="Nama lengkap"
            autoComplete="name"
            defaultValue={values.customerName}
            error={errors.customerName}
          />
          <Field
            name="phone"
            label="Nomor WhatsApp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="08xx xxxx xxxx"
            defaultValue={values.phone}
            error={errors.phone}
          />
        </div>

        <Field
          name="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nama@email.com"
          defaultValue={values.email}
          error={errors.email}
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="eyebrow mb-4">Alamat pengiriman</legend>

        <div>
          <label htmlFor="address" className="label">
            Alamat lengkap
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            autoComplete="street-address"
            placeholder="Jalan, nomor rumah, RT/RW, patokan"
            defaultValue={values.address}
            aria-invalid={errors.address ? true : undefined}
            aria-describedby={errors.address ? "address-error" : undefined}
            className="input"
          />
          {errors.address ? (
            <p id="address-error" className="field-error">
              {errors.address}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="city"
            label="Kota / kabupaten"
            autoComplete="address-level2"
            defaultValue={values.city}
            error={errors.city}
          />
          <Field
            name="postalCode"
            label="Kode pos"
            inputMode="numeric"
            autoComplete="postal-code"
            defaultValue={values.postalCode}
            error={errors.postalCode}
          />
        </div>

        <div>
          <label htmlFor="notes" className="label">
            Catatan (opsional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder="Warna cadangan, jam kirim, permintaan khusus…"
            defaultValue={values.notes}
            className="input"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-4">Cara bayar</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="transfer"
              defaultChecked={values.paymentMethod !== "cod"}
              className="peer sr-only"
            />
            <span className="block border border-line p-4 transition-colors peer-checked:border-ink peer-checked:bg-paper-deep/60 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-clay">
              <span className="block text-[13px] font-semibold">
                Transfer bank
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                Instruksi rekening muncul setelah pesanan dibuat. Konfirmasi
                lewat WhatsApp.
              </span>
            </span>
          </label>

          <label className="cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              defaultChecked={values.paymentMethod === "cod"}
              className="peer sr-only"
            />
            <span className="block border border-line p-4 transition-colors peer-checked:border-ink peer-checked:bg-paper-deep/60 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-clay">
              <span className="block text-[13px] font-semibold">
                Bayar di tempat (COD)
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                Bayar tunai saat barang diterima. Tersedia untuk wilayah
                tertentu.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="space-y-3 border-t border-line pt-6">
        <SubmitButton />
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <Lock size={11} />
          Data hanya dipakai untuk memproses pesanan.
        </p>
      </div>
    </form>
  );
}

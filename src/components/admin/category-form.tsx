"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import {
  createCategoryAction,
  type CategoryFormState,
} from "@/lib/actions/admin-actions";

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
        "Tambah kategori"
      )}
    </button>
  );
}

export function CategoryForm() {
  const [state, formAction] = useActionState<CategoryFormState, FormData>(
    createCategoryAction,
    {},
  );
  const values = state.values ?? {};
  const val = (key: string) => values[key] ?? "";

  return (
    <form key={state.nonce ?? 0} action={formAction} className="space-y-5">
      {state.error ? (
        <p
          role="alert"
          className="border border-clay/30 bg-clay/5 px-3 py-2.5 text-[13px] text-clay-deep"
        >
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="flex items-center gap-2 border border-moss/30 bg-moss/5 px-3 py-2.5 text-[13px] text-moss">
          <Check size={14} />
          Kategori ditambahkan.
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="label">
          Nama kategori
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Rumah"
          defaultValue={val("name")}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="slug" className="label">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          placeholder="otomatis dari nama"
          defaultValue={val("slug")}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="blurb" className="label">
          Deskripsi singkat
        </label>
        <textarea
          id="blurb"
          name="blurb"
          rows={3}
          placeholder="Satu kalimat tentang isi kategori ini."
          defaultValue={val("blurb")}
          className="input"
        />
      </div>

      <SubmitButton />
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { formatIDR } from "@/lib/format";
import {
  saveProductAction,
  type ProductFormState,
} from "@/lib/actions/admin-actions";

export type ProductInitial = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  tagline: string;
  description: string;
  price: number;
  compareAt: number | null;
  stock: number;
  status: string;
  material: string | null;
  dimensions: string | null;
  care: string | null;
  origin: string | null;
  imageUrl: string | null;
  variants: {
    label: string;
    sku: string;
    price: number | null;
    stock: number;
  }[];
};

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
        "Tambahkan produk"
      )}
    </button>
  );
}

function Field({
  name,
  label,
  hint,
  error,
  defaultValue,
  type = "text",
  inputMode,
  placeholder,
  className,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  defaultValue?: string | number;
  type?: string;
  inputMode?: "text" | "numeric";
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
      ) : hint ? (
        <p className="mt-1 text-[11px] leading-relaxed text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: { id: string; name: string }[];
  initial?: ProductInitial;
}) {
  const [state, formAction] = useActionState<ProductFormState, FormData>(
    saveProductAction,
    {},
  );
  const errors = state.errors ?? {};
  const values = state.values ?? {};
  const editing = Boolean(initial);
  const val = (key: string, fallback?: string | number | null) =>
    values[key] ?? fallback?.toString() ?? "";
  const fileRef = useRef<HTMLInputElement>(null);
  const pickedFile = useRef<File | null>(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!state.nonce || !pickedFile.current || !fileRef.current) return;
    const transfer = new DataTransfer();
    transfer.items.add(pickedFile.current);
    fileRef.current.files = transfer.files;
  }, [state.nonce]);

  const variantText = initial?.variants
    .map((variant) =>
      [
        variant.label,
        variant.sku,
        variant.price ?? "",
        variant.stock,
      ].join(" | "),
    )
    .join("\n");

  return (
    <form key={state.nonce ?? 0} action={formAction} className="space-y-6">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

      {state.error ? (
        <p
          role="alert"
          className="border border-clay/30 bg-clay/5 px-4 py-3 text-[13px] leading-relaxed text-clay-deep"
        >
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="border border-line bg-paper p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Informasi dasar
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field
                name="name"
                label="Nama produk"
                defaultValue={val("name", initial?.name)}
                error={errors.name}
              />
              <Field
                name="slug"
                label="Slug URL"
                defaultValue={val("slug", initial?.slug)}
                placeholder="otomatis dari nama"
                hint="Kosongkan untuk dibuat otomatis."
                error={errors.slug}
              />

              <div>
                <label htmlFor="categoryId" className="label">
                  Kategori
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={val("categoryId", initial?.categoryId ?? "")}
                  className="input"
                >
                  <option value="">Pilih kategori…</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId ? (
                  <p className="field-error">{errors.categoryId}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="status" className="label">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={val("status", initial?.status ?? "draft")}
                  className="input"
                >
                  <option value="draft">Draf — tidak tampil</option>
                  <option value="active">Aktif — tampil di katalog</option>
                  <option value="archived">Arsip — disembunyikan</option>
                </select>
                {errors.status ? (
                  <p className="field-error">{errors.status}</p>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <Field
                  name="tagline"
                  label="Ringkasan satu baris"
                  defaultValue={val("tagline", initial?.tagline)}
                  placeholder="Gelas stoneware 220 ml dengan bibir tebal."
                  error={errors.tagline}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="label">
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  defaultValue={val("description", initial?.description)}
                  placeholder="Bahan, cara buat, dan untuk apa barang ini dipakai."
                  aria-invalid={errors.description ? true : undefined}
                  className="input"
                />
                {errors.description ? (
                  <p className="field-error">{errors.description}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="border border-line bg-paper p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Harga & stok
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <Field
                name="price"
                label="Harga (Rp)"
                inputMode="numeric"
                defaultValue={val("price", initial?.price ?? "")}
                placeholder="145000"
                error={errors.price}
              />
              <Field
                name="compareAt"
                label="Harga sebelum diskon"
                inputMode="numeric"
                defaultValue={val("compareAt", initial?.compareAt ?? "")}
                placeholder="opsional"
                hint="Harus lebih tinggi dari harga jual."
              />
              <Field
                name="stock"
                label="Stok"
                inputMode="numeric"
                defaultValue={val("stock", initial?.stock ?? 0)}
                error={errors.stock}
              />
            </div>
            {initial ? (
              <p className="mt-4 text-[11px] text-muted">
                Harga saat ini: {formatIDR(initial.price)}
              </p>
            ) : null}
          </section>

          <section className="border border-line bg-paper p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Detail bahan
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field
                name="material"
                label="Bahan"
                defaultValue={val("material", initial?.material ?? "")}
                placeholder="Stoneware lokal, glasir bebas timbal"
              />
              <Field
                name="dimensions"
                label="Ukuran"
                defaultValue={val("dimensions", initial?.dimensions ?? "")}
                placeholder="Diameter 8 cm, tinggi 9 cm"
              />
              <Field
                name="care"
                label="Perawatan"
                defaultValue={val("care", initial?.care ?? "")}
                placeholder="Boleh dicuci mesin…"
              />
              <Field
                name="origin"
                label="Asal"
                defaultValue={val("origin", initial?.origin ?? "")}
                placeholder="Kasongan, Yogyakarta"
              />
            </div>
          </section>

          <section className="border border-line bg-paper p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Varian
            </h2>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Satu varian per baris, pisahkan dengan tanda{" "}
              <code className="bg-paper-deep px-1">|</code>. Urutan: label | SKU |
              harga (opsional) | stok. Kosongkan bila produk tidak punya varian.
            </p>
            <textarea
              id="variants"
              name="variants"
              rows={4}
              defaultValue={val("variants", variantText)}
              placeholder={"Natural | TAS-NAT | 320000 | 5\nArang | TAS-ARG | | 4"}
              className="input mt-3 font-mono text-[12px]"
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-line bg-paper p-5 xl:sticky xl:top-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Foto produk
            </h2>

            {initial?.imageUrl ? (
              <div className="mt-4 border border-line bg-paper-deep/40 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={initial.imageUrl}
                  alt={`Foto ${initial.name}`}
                  className="aspect-[4/5] w-full object-cover"
                />
                <p className="mt-2 px-1 text-[10px] uppercase tracking-[0.1em] text-muted">
                  Foto saat ini
                </p>
              </div>
            ) : null}

            <div className="mt-4">
              <label htmlFor="image" className="label">
                Unggah foto
              </label>
              <input
                ref={fileRef}
                id="image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  pickedFile.current = file;
                  setFileName(file?.name ?? "");
                }}
                className="block w-full text-[12px] text-ink-soft file:mr-3 file:border file:border-line file:bg-paper-deep/60 file:px-3 file:py-2 file:text-[10px] file:font-semibold file:uppercase file:tracking-[0.1em] hover:file:border-ink"
              />
              {fileName ? (
                <p className="mt-1 text-[11px] font-medium text-moss">
                  Foto dipilih: {fileName}
                </p>
              ) : null}
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                JPG, PNG, WebP, AVIF, atau GIF. Maks 5 MB. Rasio 4:5 paling
                rapi. {initial ? "Unggah baru untuk mengganti foto lama." : ""}
              </p>
            </div>

            <div className="mt-6 space-y-3 border-t border-line pt-5">
              <SubmitButton editing={editing} />
              <Link href="/admin/produk" className="btn btn-ghost w-full">
                Batal
              </Link>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}

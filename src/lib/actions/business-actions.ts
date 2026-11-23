"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type BusinessState = {
  error?: string;
  ok?: boolean;
  nonce?: number;
  values?: Record<string, string>;
};

const fields = [
  "storeCity",
  "storeAddress",
  "storeEmail",
  "storeInstagram",
  "storeHours",
  "bankName",
  "bankNumber",
  "bankHolder",
] as const;

type Field = (typeof fields)[number];

function read(formData: FormData): Record<Field, string> {
  return fields.reduce(
    (values, key) => {
      values[key] = String(formData.get(key) ?? "").trim();
      return values;
    },
    {} as Record<Field, string>,
  );
}

export async function saveBusinessSettingsAction(
  _prev: BusinessState,
  formData: FormData,
): Promise<BusinessState> {
  await requireAdmin();

  const values = read(formData);
  const fail = (error: string): BusinessState => ({
    error,
    values,
    nonce: Date.now(),
  });

  const limits: Record<Field, number> = {
    storeCity: 80,
    storeAddress: 300,
    storeEmail: 120,
    storeInstagram: 80,
    storeHours: 120,
    bankName: 80,
    bankNumber: 40,
    bankHolder: 120,
  };
  const labels: Record<Field, string> = {
    storeCity: "Kota atau asal",
    storeAddress: "Alamat",
    storeEmail: "Email",
    storeInstagram: "Instagram",
    storeHours: "Jam buka",
    bankName: "Nama bank",
    bankNumber: "Nomor rekening",
    bankHolder: "Nama pemilik rekening",
  };

  for (const key of fields) {
    if (values[key].length > limits[key]) {
      return fail(`${labels[key]} terlalu panjang.`);
    }
  }

  if (values.storeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.storeEmail)) {
    return fail("Format email belum benar.");
  }

  const bankFields = [values.bankName, values.bankNumber, values.bankHolder];
  const filledBankFields = bankFields.filter(Boolean).length;
  if (filledBankFields > 0 && filledBankFields < bankFields.length) {
    return fail("Lengkapi nama bank, nomor rekening, dan nama pemilik rekening.");
  }
  if (values.bankNumber && values.bankNumber.replace(/\D/g, "").length < 5) {
    return fail("Nomor rekening minimal 5 angka.");
  }

  await prisma.$transaction(
    fields.map((key) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: values[key] },
        update: { value: values[key] },
      }),
    ),
  );

  revalidatePath("/admin/pengaturan");
  revalidatePath("/");
  revalidatePath("/kontak");
  revalidatePath("/kebijakan");
  revalidatePath("/faq");
  revalidatePath("/tentang");

  return { ok: true, nonce: Date.now() };
}

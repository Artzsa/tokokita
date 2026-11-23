"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export type SettingsState = {
  error?: string;
  ok?: boolean;
  nonce?: number;
  values?: Record<string, string>;
};

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function enabled(formData: FormData, key: string) {
  return formData.get(key) === "on" ? "true" : "false";
}

export async function saveSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireAdmin();

  const existing = await getSettings();
  const values = {
    notificationsEnabled: enabled(formData, "notificationsEnabled"),
    dryRun: enabled(formData, "dryRun"),
    loginMethod: text(formData, "loginMethod"),
    pairNumber: text(formData, "pairNumber"),
    allowedNumbers: formData.has("allowedNumbers")
      ? text(formData, "allowedNumbers")
      : existing.allowedNumbers,
    welcomeMessage: text(formData, "welcomeMessage"),
    pollMs: text(formData, "pollMs"),
    maxAttempts: text(formData, "maxAttempts"),
  };
  const fail = (error: string): SettingsState => ({
    error,
    values,
    nonce: Date.now(),
  });

  if (values.loginMethod !== "qr" && values.loginMethod !== "pairing") {
    return fail("Metode login tidak dikenal.");
  }
  if (values.loginMethod === "pairing" && !values.pairNumber) {
    return fail("Nomor pairing wajib diisi saat memakai pairing code.");
  }

  const pollMs = Number(values.pollMs);
  if (!Number.isFinite(pollMs) || pollMs < 1000 || pollMs > 600000) {
    return fail("Interval poll harus antara 1000–600000 ms.");
  }

  const maxAttempts = Number(values.maxAttempts);
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) {
    return fail("Maksimal percobaan harus antara 1–10.");
  }
  if (values.welcomeMessage.length > 500) {
    return fail("Pesan awal maksimal 500 karakter.");
  }

  await prisma.$transaction(
    Object.entries(values).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
    ),
  );

  revalidatePath("/admin/pengaturan");
  return { ok: true, nonce: Date.now() };
}

export async function retryFailedOutboxAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  await prisma.notificationOutbox.updateMany({
    where: id ? { id, state: "failed" } : { state: "failed" },
    data: { state: "pending", attempts: 0, lastError: null },
  });

  revalidatePath("/admin/pengaturan");
  revalidatePath("/admin");
}

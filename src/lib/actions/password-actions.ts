"use server";

import { compare, hash } from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type PasswordState = {
  error?: string;
  ok?: boolean;
  nonce?: number;
};

export async function changePasswordAction(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const admin = await requireAdmin();

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!current || !next || !confirm) {
    return { error: "Semua kolom wajib diisi.", nonce: Date.now() };
  }
  if (next.length < 10) {
    return {
      error: "Kata sandi baru minimal 10 karakter.",
      nonce: Date.now(),
    };
  }
  if (next !== confirm) {
    return {
      error: "Konfirmasi kata sandi tidak cocok.",
      nonce: Date.now(),
    };
  }
  if (next === current) {
    return {
      error: "Kata sandi baru harus berbeda dari yang sekarang.",
      nonce: Date.now(),
    };
  }

  const row = await prisma.admin.findUnique({
    where: { id: admin.id },
    select: { passwordHash: true },
  });

  if (!row || !(await compare(current, row.passwordHash))) {
    return { error: "Kata sandi saat ini salah.", nonce: Date.now() };
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: await hash(next, 11) },
  });

  return { ok: true, nonce: Date.now() };
}

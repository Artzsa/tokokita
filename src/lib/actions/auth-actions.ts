"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  endAdminSession,
  startAdminSession,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/db";

export type LoginState = {
  error?: string;
  email?: string;
};

type AttemptState = {
  failures: number;
  lockedUntil: number;
};

const loginAttempts = new Map<string, AttemptState>();

function clientKey(email: string, ip: string) {
  return `${ip}:${email}`;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
    (await headers()).get("x-real-ip") ||
    "unknown";
  const key = clientKey(email || "unknown", ip);
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (attempt && attempt.lockedUntil > now) {
    const minutes = Math.ceil((attempt.lockedUntil - now) / 60000);
    return {
      error: `Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.`,
      email,
    };
  }

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi.", email };
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  const valid = admin
    ? await verifyPassword(password, admin.passwordHash)
    : false;

  if (!admin || !valid) {
    const nextFailures = (attempt?.failures ?? 0) + 1;
    const lockedUntil =
      nextFailures >= 5 ? now + 5 * 60 * 1000 : 0;
    loginAttempts.set(key, {
      failures: nextFailures >= 5 ? 0 : nextFailures,
      lockedUntil,
    });
    return { error: "Email atau kata sandi salah.", email };
  }

  loginAttempts.delete(key);
  await startAdminSession(admin.id);
  redirect("/admin");
}

export async function logoutAction() {
  await endAdminSession();
  redirect("/admin/login");
}

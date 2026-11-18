"use server";

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

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi.", email };
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return { error: "Email atau kata sandi salah.", email };
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    return { error: "Email atau kata sandi salah.", email };
  }

  await startAdminSession(admin.id);
  redirect("/admin");
}

export async function logoutAction() {
  await endAdminSession();
  redirect("/admin/login");
}

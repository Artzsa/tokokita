import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import { prisma } from "./db";

const COOKIE_NAME = "tk_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

function getSecret() {
  return process.env.AUTH_SECRET ?? "dev-only-secret-change-me";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function hashPassword(password: string) {
  return hash(password, 11);
}

export function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function startAdminSession(adminId: string) {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${adminId}.${expiresAt}`;
  const value = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getAdmin() {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 3) return null;

  const [adminId, expiresAt] = parts;
  if (!safeEqual(`${adminId}.${expiresAt}.${sign(`${adminId}.${expiresAt}`)}`, raw)) {
    return null;
  }
  if (Number(expiresAt) < Date.now()) return null;

  return prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true },
  });
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

import "dotenv/config";
import { getSettings } from "../src/lib/settings";

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return "****";
  return `${digits.slice(0, 3)}****${digits.slice(-3)}`;
}

export const config = {
  sessionDir: process.env.BOT_SESSION_DIR ?? "bot/session",
  sweepMs: Number(process.env.BOT_SWEEP_MS ?? 6 * 60 * 60 * 1000),
  notificationsEnabled: true,
  dryRun: true,
  loginMethod: "qr" as "qr" | "pairing",
  pairNumber: "",
  allowedNumbersRaw: "",
  allowedNumbers: [] as string[],
  pollMs: 5000,
  maxAttempts: 3,
};

export async function refreshConfig() {
  const settings = await getSettings();
  config.notificationsEnabled = settings.notificationsEnabled;
  config.dryRun = settings.dryRun;
  config.loginMethod = settings.loginMethod;
  config.pairNumber = settings.pairNumber;
  config.allowedNumbersRaw = settings.allowedNumbers;
  config.allowedNumbers = settings.allowedNumbers
    .split(",")
    .map((value) => normalizePhone(value.trim()))
    .filter(Boolean);
  config.pollMs = settings.pollMs;
  config.maxAttempts = settings.maxAttempts;
  return config;
}

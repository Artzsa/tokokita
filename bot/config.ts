import "dotenv/config";
import { getSettings } from "../src/lib/settings";
import { maskPhone, normalizePhone } from "../src/lib/phone";

export { maskPhone, normalizePhone };

export const config = {
  sessionDir: process.env.BOT_SESSION_DIR ?? "bot/session",
  sweepMs: Number(process.env.BOT_SWEEP_MS ?? 6 * 60 * 60 * 1000),
  notificationsEnabled: true,
  dryRun: true,
  loginMethod: "qr" as "qr" | "pairing",
  pairNumber: "",
  pollMs: 5000,
  maxAttempts: 3,
};

export async function refreshConfig() {
  const settings = await getSettings();
  config.notificationsEnabled = settings.notificationsEnabled;
  config.dryRun = settings.dryRun;
  config.loginMethod = settings.loginMethod;
  config.pairNumber = settings.pairNumber;
  config.pollMs = settings.pollMs;
  config.maxAttempts = settings.maxAttempts;
  return config;
}

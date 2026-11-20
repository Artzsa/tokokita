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
  loginMethod: process.env.BOT_LOGIN_METHOD === "pairing" ? "pairing" : "qr",
  pairNumber: process.env.BOT_PAIR_NUMBER ?? "",
  allowedNumbers: (process.env.BOT_ALLOWED_NUMBERS ?? "")
    .split(",")
    .map((value) => normalizePhone(value.trim()))
    .filter(Boolean),
  dryRun: process.env.BOT_DRY_RUN === "true",
  pollMs: Number(process.env.BOT_POLL_MS ?? 5000),
  maxAttempts: Number(process.env.BOT_MAX_ATTEMPTS ?? 3),
  sweepMs: Number(process.env.BOT_SWEEP_MS ?? 6 * 60 * 60 * 1000),
};

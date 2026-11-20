import { prisma } from "./db";

export type Settings = {
  notificationsEnabled: boolean;
  dryRun: boolean;
  loginMethod: "qr" | "pairing";
  pairNumber: string;
  allowedNumbers: string;
  pollMs: number;
  maxAttempts: number;
};

function bool(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

function number(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function defaults(): Settings {
  return {
    notificationsEnabled: bool(process.env.BOT_NOTIFICATIONS_ENABLED, true),
    dryRun: bool(process.env.BOT_DRY_RUN, false),
    loginMethod: process.env.BOT_LOGIN_METHOD === "pairing" ? "pairing" : "qr",
    pairNumber: process.env.BOT_PAIR_NUMBER ?? "",
    allowedNumbers: process.env.BOT_ALLOWED_NUMBERS ?? "",
    pollMs: number(process.env.BOT_POLL_MS, 5000),
    maxAttempts: number(process.env.BOT_MAX_ATTEMPTS, 3),
  };
}

export async function getSetting(key: string) {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? "";
}

export async function setSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function getSettings(): Promise<Settings> {
  const base = defaults();
  const rows = await prisma.setting.findMany();
  const map = new Map(rows.map((row) => [row.key, row.value]));

  return {
    notificationsEnabled: bool(map.get("notificationsEnabled"), base.notificationsEnabled),
    dryRun: bool(map.get("dryRun"), base.dryRun),
    loginMethod: map.get("loginMethod") === "pairing" ? "pairing" : map.get("loginMethod") === "qr" ? "qr" : base.loginMethod,
    pairNumber: map.get("pairNumber") ?? base.pairNumber,
    allowedNumbers: map.get("allowedNumbers") ?? base.allowedNumbers,
    pollMs: number(map.get("pollMs"), base.pollMs),
    maxAttempts: number(map.get("maxAttempts"), base.maxAttempts),
  };
}

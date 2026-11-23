import { getSettings, type Settings } from "./settings";

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function whatsappNumber(settings: Settings) {
  const raw =
    settings.pairNumber ||
    settings.allowedNumbers.split(",")[0] ||
    process.env.BOT_PAIR_NUMBER ||
    "6289520223556";
  return normalizePhone(raw);
}

export async function getStoreWhatsapp() {
  return whatsappNumber(await getSettings());
}

export async function whatsappLink(message: string) {
  return `https://wa.me/${await getStoreWhatsapp()}?text=${encodeURIComponent(message)}`;
}

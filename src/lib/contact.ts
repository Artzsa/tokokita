import { getSettings } from "./settings";

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export async function getStoreWhatsapp() {
  const settings = await getSettings();
  const raw =
    settings.pairNumber ||
    settings.allowedNumbers.split(",")[0] ||
    "6283822144337";
  return normalizePhone(raw);
}

export async function whatsappLink(message: string) {
  return `https://wa.me/${await getStoreWhatsapp()}?text=${encodeURIComponent(message)}`;
}

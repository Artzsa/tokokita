import type { Settings } from "./settings";
import { inspectQris } from "./qris";

export function bankIsReady(
  settings: Pick<Settings, "bankName" | "bankNumber" | "bankHolder">,
) {
  return Boolean(
    settings.bankName.trim() &&
      settings.bankNumber.trim() &&
      settings.bankHolder.trim(),
  );
}

export function qrisIsReady(settings: Pick<Settings, "qrisPayload">) {
  if (!settings.qrisPayload.trim()) return false;
  return inspectQris(settings.qrisPayload).ok;
}

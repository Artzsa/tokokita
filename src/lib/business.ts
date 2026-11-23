import type { Settings } from "./settings";

export function bankIsReady(
  settings: Pick<Settings, "bankName" | "bankNumber" | "bankHolder">,
) {
  return Boolean(
    settings.bankName.trim() &&
      settings.bankNumber.trim() &&
      settings.bankHolder.trim(),
  );
}

const MAX_PAYLOAD_LENGTH = 2048;
const AMOUNT_TAG = "54";
const BILL_TAG = "62";
const CRC_TAG = "63";

type Field = { tag: string; value: string };

export type QrisInspection =
  | {
      ok: true;
      payload: string;
      merchantName: string;
      city: string;
    }
  | { ok: false; error: string };

function parseFields(input: string): Field[] | null {
  const fields: Field[] = [];
  let index = 0;

  while (index < input.length) {
    if (index + 4 > input.length) return null;

    const tag = input.slice(index, index + 2);
    const lengthText = input.slice(index + 2, index + 4);
    if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(lengthText)) return null;

    const length = Number(lengthText);
    const valueStart = index + 4;
    const valueEnd = valueStart + length;
    if (valueEnd > input.length) return null;

    fields.push({ tag, value: input.slice(valueStart, valueEnd) });
    index = valueEnd;
  }

  return fields;
}

function buildFields(fields: Field[]) {
  return fields
    .map((field) => `${field.tag}${String(field.value.length).padStart(2, "0")}${field.value}`)
    .join("");
}

export function crc16(input: string) {
  let crc = 0xffff;
  const bytes = new TextEncoder().encode(input);

  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function normalize(raw: string) {
  return raw.replace(/[\r\n\t]+/g, "").trim();
}

export function inspectQris(raw: string): QrisInspection {
  const payload = normalize(raw);

  if (!payload) {
    return { ok: false, error: "Isi dulu data QRIS-nya." };
  }
  if (payload.length > MAX_PAYLOAD_LENGTH) {
    return { ok: false, error: "Data QRIS terlalu panjang." };
  }
  if (payload.length < 40) {
    return { ok: false, error: "Data QRIS terlalu pendek untuk dikenali." };
  }

  const fields = parseFields(payload);
  if (!fields) {
    return { ok: false, error: "Struktur data QRIS tidak terbaca." };
  }

  const last = fields[fields.length - 1];
  if (!last || last.tag !== CRC_TAG || last.value.length !== 4) {
    return { ok: false, error: "Checksum QRIS tidak ditemukan di akhir data." };
  }

  const expected = crc16(payload.slice(0, -4));
  if (expected !== last.value.toUpperCase()) {
    return { ok: false, error: "Checksum QRIS tidak cocok. Gambar mungkin buram atau salah." };
  }

  const find = (tag: string) => fields.find((field) => field.tag === tag);

  if (find("00")?.value !== "01") {
    return { ok: false, error: "Format QRIS tidak dikenali." };
  }

  const pointOfInitiation = find("01")?.value;
  if (pointOfInitiation === "12" || find(AMOUNT_TAG)) {
    return {
      ok: false,
      error: "QRIS ini sudah berisi nominal. Pakai QRIS statis dari merchant.",
    };
  }
  if (pointOfInitiation !== "11") {
    return { ok: false, error: "Jenis QRIS tidak dikenali. Pakai QRIS statis." };
  }
  if (find("53")?.value !== "360") {
    return { ok: false, error: "Mata uang QRIS bukan rupiah." };
  }
  if (find("58")?.value !== "ID") {
    return { ok: false, error: "Negara QRIS bukan Indonesia." };
  }

  const merchantName = find("59")?.value.trim() ?? "";
  if (!merchantName) {
    return { ok: false, error: "Nama merchant tidak ada di data QRIS." };
  }

  return {
    ok: true,
    payload,
    merchantName,
    city: find("60")?.value.trim() ?? "",
  };
}

export function qrisMerchantName(raw: string) {
  const info = inspectQris(raw);
  return info.ok ? info.merchantName : "";
}

function nestedFields(raw: string) {
  const parsed = parseFields(raw);
  return parsed && parsed.length > 0 ? parsed : null;
}

export function buildDynamicQris({
  payload,
  amount,
  billNumber,
}: {
  payload: string;
  amount: number;
  billNumber: string;
}) {
  const info = inspectQris(payload);
  if (!info.ok) throw new Error(info.error);

  const rounded = Math.round(amount);
  if (!Number.isFinite(rounded) || rounded <= 0 || rounded > 999_999_999) {
    throw new Error("Nominal QRIS tidak valid.");
  }

  const bill = billNumber.replace(/[^A-Za-z0-9]/g, "").slice(0, 25);
  if (!bill) throw new Error("Nomor pesanan tidak valid untuk QRIS.");

  const fields = parseFields(info.payload);
  if (!fields) throw new Error("Data QRIS tidak terbaca.");

  const existingBill = fields.find((field) => field.tag === BILL_TAG);
  const billFields = existingBill ? nestedFields(existingBill.value) ?? [] : [];
  const nextBillFields: Field[] = [
    { tag: "01", value: bill },
    ...billFields.filter((field) => field.tag !== "01" && field.tag !== "05"),
  ].sort((a, b) => Number(a.tag) - Number(b.tag));

  const nextFields: Field[] = [
    ...fields.filter(
      (field) =>
        field.tag !== AMOUNT_TAG &&
        field.tag !== BILL_TAG &&
        field.tag !== CRC_TAG,
    ),
    { tag: AMOUNT_TAG, value: String(rounded) },
    { tag: BILL_TAG, value: buildFields(nextBillFields) },
  ]
    .map((field) => (field.tag === "01" ? { ...field, value: "12" } : field))
    .sort((a, b) => Number(a.tag) - Number(b.tag));

  const body = `${buildFields(nextFields)}${CRC_TAG}04`;
  return `${body}${crc16(body)}`;
}

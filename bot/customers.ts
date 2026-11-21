import { prisma } from "../src/lib/db";
import { normalizePhone } from "../src/lib/phone";

let cache: { phones: Set<string>; expiresAt: number } | null = null;

export async function getKnownCustomerPhones() {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.phones;

  const rows = await prisma.order.findMany({
    select: { phone: true },
    distinct: ["phone"],
  });
  const phones = new Set(
    rows.map((row) => normalizePhone(row.phone)).filter(Boolean),
  );
  cache = { phones, expiresAt: now + 60_000 };
  return phones;
}

export async function isKnownCustomer(phone: string) {
  const phones = await getKnownCustomerPhones();
  return phones.has(normalizePhone(phone));
}

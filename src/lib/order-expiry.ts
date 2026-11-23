export const PENDING_EXPIRY_MS = 3 * 24 * 60 * 60 * 1000;

export function isPendingExpired(createdAt: Date) {
  return Date.now() - createdAt.getTime() >= PENDING_EXPIRY_MS;
}

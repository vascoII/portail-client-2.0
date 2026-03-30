// Frontend-side auth session expiration helpers.
// Used to limit the effect of a "forever" localStorage auth persistence.

export const AUTH_STORAGE_TTL_MS: number =
  Number(process.env.NEXT_PUBLIC_AUTH_TTL_MS) || 12 * 60 * 60 * 1000; // default: 12h

export function isAuthSessionExpired(
  creationDate?: string | number | null
): boolean {
  if (!creationDate) return true;

  const createdAtMs =
    typeof creationDate === "number" ? creationDate : Date.parse(creationDate);

  if (!Number.isFinite(createdAtMs)) return true;

  return Date.now() - createdAtMs > AUTH_STORAGE_TTL_MS;
}


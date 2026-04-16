import {
  REFRESH_TOKEN_KEY,
  TOKEN_EXPIRES_AT_KEY,
} from "@/lib/constants/storage";

/** Per Authentication-Guide: persist refresh token (and expiry hint) only — not accessToken. */
export function persistRefreshOnly(
  refreshToken: string,
  expiresInSeconds: number
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    const expiresAtMs = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(expiresAtMs));
  } catch {
    /* quota / private mode */
  }
}

export function readRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const direct = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (direct) {
      return direct;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function clearPersistedAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
}

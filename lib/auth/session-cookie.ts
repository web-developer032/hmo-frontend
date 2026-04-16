const COOKIE_NAME = "hmo_authenticated";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

/**
 * Non-httpOnly flag for Next.js root `proxy` route hints only.
 * API calls still require a valid JWT (see Authentication-Guide.md).
 */
export function setAuthenticatedCookie(): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

export function clearAuthenticatedCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

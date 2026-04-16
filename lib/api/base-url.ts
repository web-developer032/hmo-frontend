export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
}

/** Socket.IO connects to the HTTP origin (no `/api/v1` prefix). */
export function getSocketBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  return getApiBaseUrl().replace(/\/api\/v1\/?$/, "");
}

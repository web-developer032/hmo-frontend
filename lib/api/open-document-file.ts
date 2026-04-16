import { getApiBaseUrl } from "@/lib/api/base-url";

/**
 * Opens our API-hosted document files in a new tab with the JWT (a raw link cannot send Authorization).
 */
export async function openDocumentFileUrl(
  documentUrl: string,
  accessToken: string | null,
): Promise<void> {
  const base = getApiBaseUrl().replace(/\/$/, "");
  let path: string;
  try {
    path = new URL(documentUrl).pathname;
  } catch {
    window.open(documentUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const isOurFile =
    path.includes("/documents/files/") &&
    (documentUrl.startsWith(base) ||
      documentUrl.startsWith("http://localhost") ||
      documentUrl.startsWith("http://127.0.0.1"));

  if (!isOurFile || !accessToken) {
    window.open(documentUrl, "_blank", "noopener,noreferrer");
    return;
  }

  try {
    const res = await fetch(documentUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error("failed");
    const blob = await res.blob();
    const obj = URL.createObjectURL(blob);
    window.open(obj, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(obj), 60_000);
  } catch {
    window.open(documentUrl, "_blank", "noopener,noreferrer");
  }
}

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { ApiBusinessErrorPayload, ApiErrorBody } from "@/lib/api/types";

function messageFromApiBody(body: ApiErrorBody): string | undefined {
  const { message } = body;
  if (Array.isArray(message)) {
    return message.join(", ");
  }
  if (typeof message === "string") {
    return message;
  }
  if (
    typeof message === "object" &&
    message !== null &&
    "message" in message &&
    typeof (message as ApiBusinessErrorPayload).message === "string"
  ) {
    return (message as ApiBusinessErrorPayload).message;
  }
  return undefined;
}

/** Stable `code` when the API returns `{ code, message }` inside `message`. */
export function getApiErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const e = error as FetchBaseQueryError;
  if (typeof e.data !== "object" || e.data === null) return undefined;
  const body = e.data as ApiErrorBody;
  const { message } = body;
  if (
    typeof message === "object" &&
    message !== null &&
    "code" in message &&
    typeof (message as ApiBusinessErrorPayload).code === "string"
  ) {
    return (message as ApiBusinessErrorPayload).code;
  }
  return undefined;
}

export function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") return "Something went wrong.";
  const e = error as FetchBaseQueryError;
  if (e.status === "FETCH_ERROR") {
    return "Network error — check the API is running and NEXT_PUBLIC_API_URL.";
  }
  if (typeof e.data === "object" && e.data !== null) {
    const body = e.data as ApiErrorBody;
    const fromBody = messageFromApiBody(body);
    if (fromBody) return fromBody;
  }
  if ("message" in e && typeof e.message === "string") {
    return e.message;
  }
  return "Request failed.";
}

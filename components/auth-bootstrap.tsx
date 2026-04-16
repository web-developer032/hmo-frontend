"use client";

import { useEffect, useRef, useState } from "react";
import {
  clearAuth,
  setAuthHydrated,
  setCredentials,
} from "@/features/auth/auth-slice";
import { useAppDispatch } from "@/lib/hooks";
import { getApiBaseUrl } from "@/lib/api/base-url";
import {
  clearPersistedAuth,
  persistRefreshOnly,
  readRefreshToken,
} from "@/lib/auth/persist";
import {
  clearAuthenticatedCookie,
  setAuthenticatedCookie,
} from "@/lib/auth/session-cookie";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiSuccess, AuthUser, TokenPair } from "@/lib/api/types";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function restore() {
      const refresh = readRefreshToken();
      if (!refresh) {
        dispatch(setAuthHydrated(true));
        setReady(true);
        return;
      }

      const base = getApiBaseUrl();

      try {
        const refRes = await fetch(`${base}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ refreshToken: refresh }),
        });
        if (!refRes.ok) {
          throw new Error("refresh failed");
        }
        const refJson = (await refRes.json()) as ApiSuccess<TokenPair>;
        const tokens = refJson.data;
        persistRefreshOnly(tokens.refreshToken, tokens.expiresIn);

        const meRes = await fetch(`${base}/users/me`, {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            Accept: "application/json",
          },
        });
        if (!meRes.ok) {
          throw new Error("me failed");
        }
        const meJson = (await meRes.json()) as ApiSuccess<AuthUser>;

        dispatch(
          setCredentials({
            user: meJson.data,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
          }),
        );
        setAuthenticatedCookie();
      } catch {
        dispatch(clearAuth());
        clearPersistedAuth();
        clearAuthenticatedCookie();
      } finally {
        dispatch(setAuthHydrated(true));
        setReady(true);
      }
    }

    void restore();
  }, [dispatch]);

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center gap-4 px-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <p className="text-sm text-muted">Restoring session…</p>
      </div>
    );
  }

  return <>{children}</>;
}

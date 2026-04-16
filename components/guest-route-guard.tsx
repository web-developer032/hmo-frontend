"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAppSelector } from "@/lib/hooks";

function sanitizeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

/**
 * When `user` becomes set (e.g. after login), redirect in an effect so we do not
 * unmount the form before it finishes — that previously left the UI stuck on "Redirecting…".
 */
export function GuestRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) return;
    const next = sanitizeNext(searchParams.get("next"));
    router.replace(next);
    router.refresh();
  }, [user, router, searchParams]);

  return <>{children}</>;
}

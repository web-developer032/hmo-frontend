"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppSelector } from "@/lib/hooks";

export function ProtectedRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (user) return;
    const next = encodeURIComponent(pathname || "/dashboard");
    router.replace(`/login?next=${next}`);
  }, [user, router, pathname]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}

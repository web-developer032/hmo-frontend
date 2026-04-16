"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { hasAnyRole } from "@/lib/constants/roles";
import { useAppSelector } from "@/lib/hooks";

export function RoleRouteGuard({
  children,
  allowRoles,
}: {
  children: React.ReactNode;
  allowRoles: readonly string[];
}) {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const allowed = user ? hasAnyRole(user.roles, allowRoles) : false;

  useEffect(() => {
    if (user && !allowed) {
      router.replace("/dashboard");
    }
  }, [user, allowed, router]);

  if (!user) {
    return null;
  }

  if (!allowed) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-muted">
          You do not have access to this area.
        </p>
        <Button variant="primary" size="sm" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

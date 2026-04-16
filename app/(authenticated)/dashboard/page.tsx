"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnalyticsSnapshot } from "@/features/dashboard/analytics-snapshot";
import { ChartsPanel } from "@/features/dashboard/charts-panel";
import { DashboardHub } from "@/features/dashboard/dashboard-hub";
import { useAppSelector } from "@/lib/hooks";

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const activeNavRole = useAppSelector((s) => s.ui.activeNavRole);

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <DashboardHub
        roles={user.roles}
        userName={user.name}
        activeNavRole={activeNavRole}
      />
      <AnalyticsSnapshot
        roles={user.roles}
        activeNavRole={activeNavRole}
      />
      <ChartsPanel roles={user.roles} activeNavRole={activeNavRole} />
      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="md" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}

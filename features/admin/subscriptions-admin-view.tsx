"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGetActiveSubscriptionPlansQuery } from "@/lib/api/endpoints/subscription-plan.endpoints";
import {
  useCreateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useGetSubscriptionsQuery,
} from "@/lib/api/endpoints/subscription.endpoints";
import { useGetUsersQuery } from "@/lib/api/endpoints/user.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { DataTable } from "@/components/table/data-table";
import { cn } from "@/lib/utils/cn";
import type { Subscription } from "@/lib/types/entities";
import type { ColumnDef } from "@tanstack/react-table";

const SUB_STATUSES = ["Active", "Cancelled", "Expired", "Trial"] as const;

const selectClass =
  "flex h-10 w-full min-w-[220px] cursor-pointer rounded-md border border-border bg-background px-3 text-sm";

export function SubscriptionsAdminView() {
  const { data, isLoading } = useGetSubscriptionsQuery({ page: 1, limit: 50 });
  const { data: plansData, isLoading: plansLoading } =
    useGetActiveSubscriptionPlansQuery();
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({
    page: 1,
    limit: 200,
  });
  const [createSub] = useCreateSubscriptionMutation();
  const [deleteSub] = useDeleteSubscriptionMutation();

  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState("");
  const [status, setStatus] = useState<string>(SUB_STATUSES[0]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const users = usersData?.data ?? [];
  const plans = useMemo(() => plansData?.data ?? [], [plansData?.data]);
  const resolvedPlanId = planId || plans[0]?.id || "";

  const subColumns = useMemo<ColumnDef<Subscription>[]>(
    () => [
      {
        id: "user",
        header: "User",
        cell: ({ row }) => {
          const s = row.original;
          const u = s.user;
          if (u) {
            return (
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{u.name}</p>
                <p className="truncate text-xs text-muted">{u.email}</p>
              </div>
            );
          }
          return (
            <span className="text-xs text-muted">
              Unknown user ·{" "}
              <span className="font-mono">{s.userId.slice(0, 8)}…</span>
            </span>
          );
        },
      },
      {
        id: "plan",
        header: "Plan",
        cell: ({ row }) => {
          const s = row.original;
          return s.plan?.name ?? s.tier;
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => row.original.status,
      },
      {
        id: "actions",
        header: "Actions",
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row.original.id)}
          >
            Delete
          </Button>
        ),
      },
    ],
    [],
  );

  async function add() {
    if (!userId.trim()) {
      toast.error("Choose a user");
      return;
    }
    if (!resolvedPlanId.trim()) {
      toast.error("Choose a plan");
      return;
    }
    try {
      await createSub({
        userId: userId.trim(),
        planId: resolvedPlanId.trim(),
        status,
      }).unwrap();
      toast.success("Subscription created");
      setUserId("");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete subscription?"
        description="This removes the subscription record."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await deleteSub(deleteId).unwrap();
            toast.success("Deleted");
          } catch (e) {
            toast.error(getErrorMessage(e));
          }
        }}
      />
      <PageHeader
        title="Subscriptions"
        description="Assign tiers and statuses by user — pick people by name or email."
      />

      <Card>
        <CardHeader>
          <CardTitle>New subscription</CardTitle>
          <CardDescription>
            Select a user from the directory (same list as Users admin).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[min(100%,280px)] flex-1 space-y-1.5">
            <Label htmlFor="sub-user-select" className="text-xs">
              User
            </Label>
            <select
              id="sub-user-select"
              className={cn(selectClass, usersLoading && "opacity-60")}
              value={userId}
              disabled={usersLoading || users.length === 0}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">
                {usersLoading
                  ? "Loading users…"
                  : users.length === 0
                    ? "No users in directory"
                    : "Choose user…"}
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} · {u.email}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Plan</Label>
            <select
              className={selectClass}
              value={resolvedPlanId}
              disabled={plansLoading || plans.length === 0}
              onChange={(e) => setPlanId(e.target.value)}
            >
              {plansLoading || plans.length === 0 ? (
                <option value="">
                  {plansLoading
                    ? "Loading plans…"
                    : "No active plans"}
                </option>
              ) : null}
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code}) — {p.maxProperties}/{p.maxRooms}/{p.maxTenants}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <select
              className={selectClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {SUB_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="primary"
            className="w-full sm:w-auto"
            disabled={!userId.trim() || !resolvedPlanId.trim()}
            onClick={() => void add()}
          >
            Create
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={subColumns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No subscriptions yet."
            getRowId={(s) => s.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

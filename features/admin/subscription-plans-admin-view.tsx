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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/table/data-table";
import {
  useCreateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  useGetSubscriptionPlansQuery,
  useUpdateSubscriptionPlanMutation,
} from "@/lib/api/endpoints/subscription-plan.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { cn } from "@/lib/utils/cn";
import type { SubscriptionPlan } from "@/lib/types/entities";
import type { ColumnDef } from "@tanstack/react-table";

const inputClass =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm";

export function SubscriptionPlansAdminView() {
  const { data, isLoading } = useGetSubscriptionPlansQuery();
  const [createPlan, { isLoading: creating }] =
    useCreateSubscriptionPlanMutation();
  const [updatePlan, { isLoading: updating }] =
    useUpdateSubscriptionPlanMutation();
  const [deletePlan] = useDeleteSubscriptionPlanMutation();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxProperties, setMaxProperties] = useState("1");
  const [maxRooms, setMaxRooms] = useState("3");
  const [maxTenants, setMaxTenants] = useState("3");
  const [sortOrder, setSortOrder] = useState("0");

  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const plans = data?.data ?? [];

  const columns = useMemo<ColumnDef<SubscriptionPlan>[]>(
    () => [
      { id: "code", header: "Code", cell: ({ row }) => row.original.code },
      { id: "name", header: "Name", cell: ({ row }) => row.original.name },
      {
        id: "limits",
        header: "Limits (P / R / T)",
        cell: ({ row }) => {
          const p = row.original;
          return `${p.maxProperties} / ${p.maxRooms} / ${p.maxTenants}`;
        },
      },
      {
        id: "sort",
        header: "Sort",
        cell: ({ row }) => row.original.sortOrder,
      },
      {
        id: "active",
        header: "Active",
        cell: ({ row }) => (row.original.isActive ? "Yes" : "No"),
      },
      {
        id: "actions",
        header: "",
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(row.original)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDeleteId(row.original.id)}
            >
              Remove
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  async function add() {
    if (!code.trim() || !name.trim()) {
      toast.error("Code and name are required");
      return;
    }
    try {
      await createPlan({
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        maxProperties: Number(maxProperties),
        maxRooms: Number(maxRooms),
        maxTenants: Number(maxTenants),
        sortOrder: Number(sortOrder || 0),
        isActive: true,
      }).unwrap();
      toast.success("Plan created");
      setCode("");
      setName("");
      setDescription("");
      setMaxProperties("1");
      setMaxRooms("3");
      setMaxTenants("3");
      setSortOrder("0");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function saveEdit() {
    if (!editing) return;
    try {
      await updatePlan({
        id: editing.id,
        body: {
          code: editing.code,
          name: editing.name,
          description: editing.description ?? null,
          maxProperties: editing.maxProperties,
          maxRooms: editing.maxRooms,
          maxTenants: editing.maxTenants,
          sortOrder: editing.sortOrder,
          isActive: editing.isActive,
        },
      }).unwrap();
      toast.success("Plan updated");
      setEditing(null);
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
        title="Remove plan?"
        description="If subscriptions still reference this plan, it will be deactivated instead of deleted."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await deletePlan(deleteId).unwrap();
            toast.success("Done");
          } catch (e) {
            toast.error(getErrorMessage(e));
          } finally {
            setDeleteId(null);
          }
        }}
      />
      <PageHeader
        title="Subscription plans"
        description="Templates for limits. Editing a plan does not change existing subscription rows — new assignments copy current numbers."
      />

      <Card>
        <CardHeader>
          <CardTitle>New plan</CardTitle>
          <CardDescription>
            Use a stable code (e.g. matching a billing tier). Codes must be
            unique.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Code</Label>
            <Input
              className={cn(inputClass)}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. Pro"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input
              className={cn(inputClass)}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label className="text-xs">Description</Label>
            <Input
              className={cn(inputClass)}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Max properties</Label>
            <Input
              className={cn(inputClass)}
              type="number"
              min={0}
              value={maxProperties}
              onChange={(e) => setMaxProperties(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Max rooms</Label>
            <Input
              className={cn(inputClass)}
              type="number"
              min={0}
              value={maxRooms}
              onChange={(e) => setMaxRooms(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Max tenants</Label>
            <Input
              className={cn(inputClass)}
              type="number"
              min={0}
              value={maxTenants}
              onChange={(e) => setMaxTenants(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Sort order</Label>
            <Input
              className={cn(inputClass)}
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="primary"
              disabled={creating}
              onClick={() => void add()}
            >
              {creating ? "Saving…" : "Create plan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit plan</CardTitle>
            <CardDescription>{editing.code}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Code</Label>
              <Input
                className={cn(inputClass)}
                value={editing.code}
                onChange={(e) =>
                  setEditing({ ...editing, code: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                className={cn(inputClass)}
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Input
                className={cn(inputClass)}
                value={editing.description ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max properties</Label>
              <Input
                className={cn(inputClass)}
                type="number"
                min={0}
                value={editing.maxProperties}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    maxProperties: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max rooms</Label>
              <Input
                className={cn(inputClass)}
                type="number"
                min={0}
                value={editing.maxRooms}
                onChange={(e) =>
                  setEditing({ ...editing, maxRooms: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max tenants</Label>
              <Input
                className={cn(inputClass)}
                type="number"
                min={0}
                value={editing.maxTenants}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    maxTenants: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sort order</Label>
              <Input
                className={cn(inputClass)}
                type="number"
                value={editing.sortOrder}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    sortOrder: Number(e.target.value),
                  })
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.isActive}
                onChange={(e) =>
                  setEditing({ ...editing, isActive: e.target.checked })
                }
              />
              Active
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button
                type="button"
                variant="primary"
                disabled={updating}
                onClick={() => void saveEdit()}
              >
                {updating ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All plans</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted">Loading…</p>}
          {!isLoading && (
            <DataTable
              columns={columns}
              data={plans}
              emptyMessage="No plans."
              getRowId={(p) => p.id}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

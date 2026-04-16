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
import { LandlordPropertySelect } from "@/components/forms/landlord-property-selects";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateMaintenanceTicketMutation,
  useDeleteMaintenanceTicketMutation,
  useGetMaintenanceTicketsQuery,
  useUpdateMaintenanceTicketMutation,
} from "@/lib/api/endpoints/maintenance.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { MAINTENANCE_CATEGORIES } from "@/lib/forms/maintenance-constants";
import { DataTable } from "@/components/table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { MaintenanceTicket } from "@/lib/types/entities";

export function LandlordMaintenanceView() {
  const { data, isLoading } = useGetMaintenanceTicketsQuery({
    page: 1,
    limit: 50,
  });
  const [createTicket] = useCreateMaintenanceTicketMutation();
  const [updateTicket] = useUpdateMaintenanceTicketMutation();
  const [deleteTicket] = useDeleteMaintenanceTicketMutation();

  const [propertyId, setPropertyId] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(MAINTENANCE_CATEGORIES[0]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toggleTarget, setToggleTarget] = useState<{
    id: string;
    markResolved: boolean;
    preview: string;
  } | null>(null);

  const ticketColumns = useMemo<ColumnDef<MaintenanceTicket>[]>(
    () => [
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => row.original.status,
      },
      {
        id: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="max-w-md truncate">{row.original.description}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const desc = t.description ?? "";
                  const preview =
                    desc.length > 120 ? `${desc.slice(0, 120)}…` : desc;
                  setToggleTarget({
                    id: t.id,
                    markResolved: t.status !== "Resolved",
                    preview,
                  });
                }}
              >
                Toggle resolved
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(t.id)}
              >
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  async function add() {
    if (!propertyId.trim()) {
      toast.error("Select a property");
      return;
    }
    try {
      await createTicket({
        propertyId: propertyId.trim(),
        description,
        categories: [category],
      }).unwrap();
      toast.success("Ticket created");
      setPropertyId("");
      setDescription("");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ConfirmDialog
        open={toggleTarget != null}
        onOpenChange={(open) => {
          if (!open) setToggleTarget(null);
        }}
        title={
          toggleTarget?.markResolved
            ? "Mark ticket as resolved?"
            : "Reopen this ticket?"
        }
        description={
          toggleTarget
            ? toggleTarget.markResolved
              ? `Mark resolved: “${toggleTarget.preview}”`
              : `Reopen: “${toggleTarget.preview}”`
            : ""
        }
        confirmLabel={toggleTarget?.markResolved ? "Mark resolved" : "Reopen"}
        onConfirm={async () => {
          if (!toggleTarget) return;
          try {
            await updateTicket({
              id: toggleTarget.id,
              body: {
                status: toggleTarget.markResolved ? "Resolved" : "Open",
              },
            }).unwrap();
            toast.success("Updated");
          } catch (e) {
            toast.error(getErrorMessage(e));
          }
        }}
      />
      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete maintenance ticket?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await deleteTicket(deleteId).unwrap();
            toast.success("Deleted");
          } catch (e) {
            toast.error(getErrorMessage(e));
          }
        }}
      />
      <PageHeader
        title="Maintenance"
        description="Raise and track tickets for your properties."
      />

      <Card>
        <CardHeader>
          <CardTitle>New ticket</CardTitle>
          <CardDescription>Choose a property and describe the issue.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <LandlordPropertySelect
            value={propertyId}
            onChange={setPropertyId}
            label="Property"
          />
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <select
              className="flex h-10 rounded-md border border-border bg-background px-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {MAINTENANCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[240px] flex-1 space-y-1">
            <Label className="text-xs">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="primary"
            className="self-end"
            onClick={() => void add()}
          >
            Create
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={ticketColumns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No tickets yet."
            getRowId={(t) => t.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import {
  useCreateMaintenanceTicketMutation,
  useGetMaintenanceTicketsQuery,
} from "@/lib/api/endpoints/maintenance.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { useGetTenantProfileMeQuery } from "@/lib/api/endpoints/tenant.endpoints";
import { MAINTENANCE_CATEGORIES } from "@/lib/forms/maintenance-constants";
import { isTenantOccupyingTenancyStatus } from "@/lib/tenancy/tenancy-status";
import { DataTable } from "@/components/table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { MaintenanceTicket } from "@/lib/types/entities";

export function TenantMaintenanceView() {
  const { data: me } = useGetTenantProfileMeQuery();
  const { data: tickets, isLoading } = useGetMaintenanceTicketsQuery({
    page: 1,
    limit: 50,
  });
  const [createTicket] = useCreateMaintenanceTicketMutation();

  const propertyId = useMemo(() => {
    const tenancies = me?.data?.tenancies ?? [];
    const current =
      tenancies.find((t) => isTenantOccupyingTenancyStatus(t.status)) ??
      tenancies[0];
    return (
      current?.room?.property?.id ??
      current?.room?.propertyId ??
      current?.property?.id ??
      current?.propertyId ??
      ""
    );
  }, [me?.data?.tenancies]);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(MAINTENANCE_CATEGORIES[0]);

  const tenantTicketColumns = useMemo<ColumnDef<MaintenanceTicket>[]>(
    () => [
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => row.original.status,
      },
      {
        id: "description",
        header: "Description",
        cell: ({ row }) => row.original.description,
      },
      {
        id: "created",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-xs text-muted">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    []
  );

  async function add() {
    if (!propertyId) {
      toast.error("No property linked to your tenancy yet.");
      return;
    }
    try {
      await createTicket({
        propertyId,
        description,
        categories: [category],
      }).unwrap();
      toast.success("Request submitted");
      setDescription("");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        title="Maintenance"
        description="Report issues for your property."
      />

      <Card>
        <CardHeader>
          <CardTitle>New request</CardTitle>
          <CardDescription>
            {propertyId
              ? `Property ID: ${propertyId}`
              : "Link a tenancy with a room to enable requests."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
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
            <Label className="text-xs">What is wrong?</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="primary"
            className="self-end"
            disabled={!propertyId}
            onClick={() => void add()}
          >
            Submit
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tenantTicketColumns}
            data={tickets?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No tickets yet."
            getRowId={(t) => t.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

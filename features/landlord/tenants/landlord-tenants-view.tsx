"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useMemo, useState } from "react";
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
import {
  useDeleteTenantProfileMutation,
  useGetTenanciesQuery,
  useGetTenantProfilesQuery,
} from "@/lib/api/endpoints/tenant.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { formatTenancyStatusLabel } from "@/lib/tenancy/tenancy-status";
import { DataTable } from "@/components/table/data-table";
import type { Tenancy, TenantProfile } from "@/lib/types/entities";
import type { ColumnDef } from "@tanstack/react-table";

export function LandlordTenantsView() {
  const { data: profiles, isLoading: pLoad } = useGetTenantProfilesQuery({
    page: 1,
    limit: 50,
  });
  const { data: tenancies, isLoading: tLoad } = useGetTenanciesQuery({
    page: 1,
    limit: 50,
  });
  const [deleteProfile] = useDeleteTenantProfileMutation();

  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);

  const profileColumns = useMemo<ColumnDef<TenantProfile>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => row.original.fullName,
      },
      {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => row.original.contactNumber,
      },
      {
        id: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.id}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={`/landlord/tenants/profiles/${row.original.id}`}>
                View profile
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDeleteProfileId(row.original.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const tenancyColumns = useMemo<ColumnDef<Tenancy>[]>(
    () => [
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => formatTenancyStatusLabel(row.original.status),
      },
      {
        id: "rent",
        header: "Rent",
        cell: ({ row }) => `£${Number(row.original.rentAmount).toFixed(2)}`,
      },
      {
        id: "start",
        header: "Start",
        cell: ({ row }) => String(row.original.startDate).slice(0, 10),
      },
      {
        id: "place",
        header: "Room / property",
        cell: ({ row }) => {
          const tn = row.original;
          return (
            <span className="font-mono text-xs">
              {tn.roomId ? (
                <Link
                  href="/landlord/properties"
                  className="text-primary hover:underline"
                >
                  {tn.roomId}
                </Link>
              ) : tn.propertyId ? (
                <Link
                  href={`/landlord/properties/${tn.propertyId}`}
                  className="text-primary hover:underline"
                >
                  {tn.propertyId}
                </Link>
              ) : (
                "—"
              )}
            </span>
          );
        },
      },
      {
        id: "profile",
        header: "Tenant",
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
        cell: ({ row }) => {
          const tid = row.original.tenantId;
          if (!tid) return "—";
          return (
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={`/landlord/tenants/profiles/${tid}`}>View profile</Link>
            </Button>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ConfirmDialog
        open={deleteProfileId != null}
        onOpenChange={(open) => {
          if (!open) setDeleteProfileId(null);
        }}
        title="Delete tenant profile?"
        description="Removes this profile. Active, pending, or notice-period tenancies block deletion."
        confirmLabel="Delete profile"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteProfileId) return;
          try {
            await deleteProfile(deleteProfileId).unwrap();
            toast.success("Deleted");
          } catch (e) {
            toast.error(getErrorMessage(e));
          }
        }}
      />
      <PageHeader
        title="Tenants"
        description="Review profiles and tenancies. New lets start from listing applications — accept an application, then start the tenancy when documents are ready."
      />

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Start a new tenancy</CardTitle>
          <CardDescription>
            You cannot create a tenancy manually here. Use Applications to
            accept a tenant, complete documents, then start the tenancy from the
            application row.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="primary" asChild>
            <Link href="/landlord/applications">Go to applications</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tenant profiles</CardTitle>
          <CardDescription>
            Profiles linked to your properties or applications. Open a profile
            for full details when you have a relationship (application or
            tenancy).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable
            columns={profileColumns}
            data={profiles?.data ?? []}
            isLoading={pLoad}
            emptyMessage="No tenant profiles found."
            getRowId={(t) => t.id}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tenancies</CardTitle>
          <CardDescription>
            Active and pending lets on your portfolio. Created when you accept
            applications and progress the workflow — not from manual entry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tenancyColumns}
            data={tenancies?.data ?? []}
            isLoading={tLoad}
            emptyMessage="No tenancies yet."
            getRowId={(tn) => tn.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

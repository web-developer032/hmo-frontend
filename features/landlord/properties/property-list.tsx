"use client";

import { useMemo } from "react";
import Link from "next/link";
import { DataTable } from "@/components/table/data-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useGetPropertiesQuery } from "@/lib/api/endpoints/property.endpoints";
import { isHmoPropertyType } from "@/lib/forms/property-constants";
import type { ColumnDef } from "@tanstack/react-table";
import type { Property } from "@/lib/types/entities";

export function PropertyList() {
  const { data, isLoading, isError } = useGetPropertiesQuery({
    page: 1,
    limit: 50,
  });

  const properties = data?.data ?? [];
  const hmoCount = properties.filter((property) =>
    isHmoPropertyType(property.propertyType)
  ).length;
  const totalRooms = properties.reduce(
    (sum, property) =>
      sum +
      (isHmoPropertyType(property.propertyType)
        ? property.numberOfRooms ?? 0
        : 0),
    0
  );

  const columns = useMemo<ColumnDef<Property>[]>(
    () => [
      {
        id: "address",
        header: "Address",
        cell: ({ row: { original: p } }) => {
          const title = p.displayName?.trim() || p.address;
          return (
            <>
              <Link
                href={`/landlord/properties/${p.id}`}
                className="text-base font-semibold text-primary hover:underline"
              >
                {title}
              </Link>
              <div className="mt-1 text-sm text-muted">
                {p.city} | {p.postcode}
              </div>
            </>
          );
        },
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row: { original: p } }) => (
          <span className="text-sm text-muted">{p.propertyType}</span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row: { original: p } }) => <StatusBadge status={p.status} />,
      },
      {
        id: "rooms",
        header: "Rooms",
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right text-sm font-medium text-foreground",
        },
        cell: ({ row: { original: p } }) =>
          isHmoPropertyType(p.propertyType) ? (p.numberOfRooms ?? "—") : "—",
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description="Your HMO and single-let inventory. Add sites, rooms, listings, and compliance from each property."
        action={
          <Button variant="primary" size="md" asChild>
            <Link href="/landlord/properties/new">Add property</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-md)] border border-[var(--border-design)] bg-card p-4 shadow-[var(--shadow-sm)]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Properties
          </p>
          <p className="mt-2 font-serif text-2xl font-normal tracking-tight">
            {properties.length}
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border-design)] bg-card p-4 shadow-[var(--shadow-sm)]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            HMO sites
          </p>
          <p className="mt-2 font-serif text-2xl font-normal tracking-tight">
            {hmoCount}
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border-design)] bg-card p-4 shadow-[var(--shadow-sm)]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Rooms
          </p>
          <p className="mt-2 font-serif text-2xl font-normal tracking-tight">
            {totalRooms}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
          <CardDescription>
            Addresses, type, status, and room counts at a glance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isError && (
            <p className="text-sm text-destructive">
              Could not load properties.
            </p>
          )}
          {!isError && (
            <div className="rounded-[var(--radius-md)] border border-[var(--border-design)] bg-[var(--paper-2)] px-4 py-3">
              <DataTable
                columns={columns}
                data={properties}
                isLoading={isLoading}
                emptyMessage="No properties yet."
                getRowId={(p) => p.id}
                minTableWidth="min-w-[560px]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

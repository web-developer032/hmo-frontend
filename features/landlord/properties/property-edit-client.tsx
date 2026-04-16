"use client";

import { PropertyForm } from "@/features/landlord/properties/property-form";
import { useGetPropertyQuery } from "@/lib/api/endpoints/property.endpoints";

export function PropertyEditClient({ propertyId }: { propertyId: string }) {
  const { data, isLoading, isError } = useGetPropertyQuery(propertyId);

  if (isLoading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }
  if (isError || !data?.data) {
    return <p className="text-sm text-destructive">Property not found.</p>;
  }

  return <PropertyForm mode="edit" initial={data.data} />;
}

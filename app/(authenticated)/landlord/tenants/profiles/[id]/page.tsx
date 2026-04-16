"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { useGetTenantProfileForLandlordQuery } from "@/lib/api/endpoints/tenant.endpoints";
import { LandlordTenantProfileReadOnly } from "@/features/landlord/tenants/landlord-tenant-profile-read-only";

export default function LandlordTenantProfilePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { data, isLoading, isError } = useGetTenantProfileForLandlordQuery(
    id,
    { skip: !id },
  );

  if (!id) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-muted">Invalid profile.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <PageHeader title="Tenant profile" />
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <PageHeader title="Tenant profile" />
        <p className="text-sm text-muted">
          Profile not found or you do not have access.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Tenant profile"
        description="Read-only details for an applicant or tenant linked to your properties."
      />
      <LandlordTenantProfileReadOnly
        profile={data.data}
        backHref="/landlord/tenants"
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useGetMyApplicationsQuery } from "@/lib/api/endpoints/listing.endpoints";

export default function TenantApplicationsPage() {
  const { data, isLoading } = useGetMyApplicationsQuery({
    page: 1,
    limit: 50,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="My applications"
        description="Track where each application sits, from initial review through to accepted tenancy steps."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Submitted</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {data?.data?.length ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Under review</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {data?.data?.filter((a) => a.status === "Pending").length ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Accepted</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {data?.data?.filter((a) => a.status === "Accepted").length ?? 0}
          </CardContent>
        </Card>
      </div>
      {isLoading && <p className="text-sm text-muted">Loading…</p>}
      <ul className="grid gap-4 xl:grid-cols-2">
        {data?.data?.map((a) => (
          <li key={a.id}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {a.listing?.title ?? "Listing"}
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={a.status} />
                  <Link
                    href={`/tenant/listings/${a.listingId}`}
                    className="text-primary hover:underline"
                  >
                    View listing
                  </Link>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-sm text-muted">
                <div className="rounded-[var(--radius-md)] bg-[var(--paper-2)] p-4">
                  {a.status === "Pending" &&
                    "The landlord is reviewing your application and profile details."}
                  {a.status === "Accepted" &&
                    "Your application has been accepted. The tenancy step comes next once terms and documents are ready."}
                  {a.status === "Declined" &&
                    "This application was declined. You can return to search and apply to other listings."}
                  {a.status !== "Pending" &&
                    a.status !== "Accepted" &&
                    a.status !== "Declined" &&
                    "Your application is in progress."}
                </div>
                {a.message ? <p>Your note: {a.message}</p> : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {!isLoading && data?.data?.length === 0 && (
        <p className="text-sm text-muted">No applications yet.</p>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useAcceptListingApplicationMutation,
  useDeclineListingApplicationMutation,
  useGetLandlordApplicationInboxQuery,
  useStartTenancyFromApplicationMutation,
} from "@/lib/api/endpoints/listing.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { ApplicationTenancyDocuments } from "@/features/landlord/applications/application-tenancy-documents";

type AppConfirm =
  | null
  | {
      kind: "accept" | "decline" | "start";
      applicationId: string;
      listingTitle: string;
    };

export default function LandlordApplicationsPage() {
  const { data, isLoading } = useGetLandlordApplicationInboxQuery({
    page: 1,
    limit: 50,
  });
  const [accept, { isLoading: acc }] = useAcceptListingApplicationMutation();
  const [decline, { isLoading: dec }] = useDeclineListingApplicationMutation();
  const [startTenancy, { isLoading: starting }] =
    useStartTenancyFromApplicationMutation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<AppConfirm>(null);

  async function runConfirmedAction() {
    if (!confirm) return;
    const id = confirm.applicationId;
    setBusyId(id);
    try {
      if (confirm.kind === "accept") {
        await accept(id).unwrap();
        toast.success(
          "Application accepted. Complete documents, then start tenancy.",
        );
      } else if (confirm.kind === "decline") {
        await decline(id).unwrap();
        toast.success("Application declined");
      } else {
        await startTenancy(id).unwrap();
        toast.success("Tenancy started");
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ConfirmDialog
        open={confirm != null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={
          confirm?.kind === "accept"
            ? "Accept application?"
            : confirm?.kind === "decline"
              ? "Decline application?"
              : "Start tenancy?"
        }
        description={
          confirm
            ? confirm.kind === "accept"
              ? `Accept “${confirm.listingTitle}”? Other pending applicants for this listing will be declined.`
              : confirm.kind === "decline"
                ? `Decline “${confirm.listingTitle}”?`
                : `Start the tenancy for “${confirm.listingTitle}”? Ensure documents are agreed by both parties first.`
            : ""
        }
        confirmLabel={
          confirm?.kind === "decline" ? "Decline" : confirm?.kind === "start" ? "Start tenancy" : "Accept"
        }
        variant={confirm?.kind === "decline" ? "destructive" : "default"}
        onConfirm={() => void runConfirmedAction()}
      />
      <PageHeader
        title="Applications"
        description="Review applicant interest, decide the next step, and move accepted applications into tenancy workflow once documents are ready."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending review</CardTitle>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ready for tenancy start</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {data?.data?.filter((a) => a.status === "Accepted" && a.tenancyId)
              .length ?? 0}
          </CardContent>
        </Card>
      </div>
      {isLoading && <p className="text-sm text-muted">Loading…</p>}
      <ul className="grid gap-4 xl:grid-cols-2">
        {data?.data?.map((a) => (
          <li key={a.id}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {a.listing?.title ?? "Listing"}
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  <span>
                    {a.applicant?.name ?? "Applicant"} · {a.applicant?.email}
                  </span>
                  <StatusBadge status={a.status} />
                  {a.applicantTenantProfileId ? (
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link
                        href={`/landlord/tenants/profiles/${a.applicantTenantProfileId}`}
                      >
                        View profile
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted">No profile yet</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[var(--radius-md)] bg-[var(--paper-2)] p-4 text-sm">
                  <p className="font-medium text-foreground">Workflow note</p>
                  <p className="mt-1 text-muted">
                    Accepting progresses this applicant into the tenancy flow.
                    Start tenancy only after the required documents and terms are
                    in place.
                  </p>
                </div>
                {a.message && (
                  <p className="text-sm text-muted">Message: {a.message}</p>
                )}
                {(a.status === "Accepted" || a.status === "Completed") &&
                  a.tenancyId && (
                  <ApplicationTenancyDocuments
                    tenancyId={a.tenancyId}
                    actionsDisabled={
                      acc ||
                      dec ||
                      starting ||
                      busyId === a.id ||
                      a.status === "Completed"
                    }
                  />
                )}
                {a.status === "Pending" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={acc || dec || starting || busyId === a.id}
                      onClick={() =>
                        setConfirm({
                          kind: "accept",
                          applicationId: a.id,
                          listingTitle: a.listing?.title ?? "Listing",
                        })
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={acc || dec || starting || busyId === a.id}
                      onClick={() =>
                        setConfirm({
                          kind: "decline",
                          applicationId: a.id,
                          listingTitle: a.listing?.title ?? "Listing",
                        })
                      }
                    >
                      Decline
                    </Button>
                  </div>
                )}
                {a.status === "Accepted" && a.tenancyId && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={acc || dec || starting || busyId === a.id}
                      onClick={() =>
                        setConfirm({
                          kind: "start",
                          applicationId: a.id,
                          listingTitle: a.listing?.title ?? "Listing",
                        })
                      }
                    >
                      Start tenancy
                    </Button>
                  </div>
                )}
                {a.status === "Completed" && a.tenancyId && (
                  <p className="text-sm text-muted">
                    Tenancy is active — this application is complete.
                  </p>
                )}
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

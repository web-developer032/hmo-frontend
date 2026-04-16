"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useApplyToListingMutation,
  useGetListingQuery,
  useGetMyApplicationsQuery,
} from "@/lib/api/endpoints/listing.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { rentPeriodLabel } from "@/lib/forms/property-constants";

export default function TenantListingDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { data, isLoading, isError } = useGetListingQuery(id, { skip: !id });
  const { data: myApplications } = useGetMyApplicationsQuery(
    { page: 1, limit: 100 },
    { skip: !id }
  );
  const [apply, { isLoading: applying }] = useApplyToListingMutation();
  const [message, setMessage] = useState("");
  const [applyConfirmOpen, setApplyConfirmOpen] = useState(false);

  const l = data?.data;
  const currentApplication = (myApplications?.data ?? []).find(
    (app) => app.listingId === id
  );
  const applicationStatus = currentApplication?.status;
  const canApply =
    l?.published &&
    (applicationStatus == null || applicationStatus === "Declined");

  async function onApply() {
    if (!id) return;
    try {
      await apply({
        listingId: id,
        body: { message: message.trim() || undefined },
      }).unwrap();
      toast.success("Application sent");
      setMessage("");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  if (!id) {
    return <p className="text-sm text-destructive">Invalid listing.</p>;
  }
  if (isLoading) return <p className="text-sm text-muted">Loading...</p>;
  if (isError || !l) {
    return <p className="text-sm text-destructive">Listing not found.</p>;
  }

  const p = l.property;

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={applyConfirmOpen}
        onOpenChange={setApplyConfirmOpen}
        title="Submit application?"
        description={`Send your application for “${l.title}”? The landlord will review it and may message you.`}
        confirmLabel="Submit application"
        onConfirm={() => void onApply()}
      />
      <p className="text-sm text-muted">
        <Link href="/tenant/listings" className="hover:text-(--hero)">
          Listings
        </Link>
        <span className="mx-2">/</span>
        <span>{l.title}</span>
      </p>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <Card className="overflow-hidden bg-[linear-gradient(145deg,rgba(31,76,107,0.98),rgba(95,131,152,0.84))] text-white">
            <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-5">
                <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                  {l.room
                    ? `Room ${l.room.roomNumber}`
                    : p?.propertyType ?? "Listing"}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">{l.title}</h1>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/74">
                    {p?.address}, {p?.city} {p?.postcode}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/58">
                      Rent
                    </p>
                    <p className="mt-3 text-2xl font-bold">
                      GBP {Number(l.rentAmount).toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      {rentPeriodLabel(l.rentFrequency)}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/58">
                      Deposit
                    </p>
                    <p className="mt-3 text-2xl font-bold">
                      {l.depositAmount != null
                        ? `GBP ${Number(l.depositAmount).toFixed(2)}`
                        : "TBC"}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/58">
                      Status
                    </p>
                    <p className="mt-3 text-2xl font-bold">
                      {l.published ? "Open" : "Draft"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="min-h-[260px] rounded-[32px] bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(255,255,255,0.05))] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
                <div className="flex h-full flex-col justify-between rounded-[26px] border border-white/10 bg-white/8 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/60">
                      Overview
                    </p>
                    <p className="mt-4 text-sm leading-7 text-white/78">
                      {l.summary?.trim() ||
                        "A thoughtfully presented rental opportunity, adapted into a desktop detail experience from the original mobile-first Figma styling."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-6">
                    <Button
                      variant="outline"
                      size="md"
                      className="border-white/20 bg-white/10 text-white hover:bg-white/16"
                      asChild
                    >
                      <Link href="/tenant/listings">Back to listings</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">About this listing</CardTitle>
              <CardDescription>
                Key context for the property and the current application flow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted">
              <p>
                {l.summary?.trim() ||
                  "This listing does not yet include a written summary, but the application workflow is available through the platform."}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] bg-(--surface) p-4 shadow-[inset_0_0_0_1px_var(--border)]">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    City
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    {p?.city || "Unknown"}
                  </p>
                </div>
                <div className="rounded-[22px] bg-(--surface) p-4 shadow-[inset_0_0_0_1px_var(--border)]">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Postcode
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    {p?.postcode || "Unknown"}
                  </p>
                </div>
                <div className="rounded-[22px] bg-(--surface) p-4 shadow-[inset_0_0_0_1px_var(--border)]">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Type
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    {p?.propertyType || "Property"}
                  </p>
                </div>
              </div>
              {l.room && (
                <p>
                  Room sharing:{" "}
                  {l.room.allowsMultipleTenants
                    ? `Allowed (max ${l.room.maxTenants ?? 2} tenants)`
                    : "Not allowed"}
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <aside id="listing-apply" className="xl:sticky xl:top-32 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Apply</CardTitle>
              <CardDescription>
                You need a tenant profile. The landlord will accept or decline
                in their inbox.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {applicationStatus && (
                <p className="text-sm font-medium text-primary">
                  Application {applicationStatus.toLowerCase()}
                </p>
              )}
              <textarea
                className="min-h-[180px] w-full rounded-[22px] border border-transparent bg-(--surface) px-4 py-4 text-sm text-foreground shadow-[inset_0_0_0_1px_var(--border)] outline-none"
                placeholder="Add an optional message for the landlord"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={applying || !canApply}
                onClick={() => setApplyConfirmOpen(true)}
              >
                {applying
                  ? "Sending..."
                  : applicationStatus === "Pending"
                  ? "Application pending"
                  : applicationStatus === "Accepted"
                  ? "Application accepted"
                  : "Submit application"}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

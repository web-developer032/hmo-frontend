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
  useDeleteListingMutation,
  useGetMyListingsQuery,
  useUpdateListingMutation,
} from "@/lib/api/endpoints/listing.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { rentAmountSuffix } from "@/lib/forms/property-constants";
import type { Listing } from "@/lib/types/entities";

export default function LandlordMyListingsPage() {
  const { data, isLoading } = useGetMyListingsQuery({ page: 1, limit: 50 });
  const [updateListing, { isLoading: saving }] = useUpdateListingMutation();
  const [deleteListing, { isLoading: del }] = useDeleteListingMutation();
  const [confirmState, setConfirmState] = useState<
    | null
    | { kind: "toggle"; listing: Listing }
    | { kind: "delete"; listing: Listing }
  >(null);

  async function runTogglePublished() {
    if (!confirmState || confirmState.kind !== "toggle") return;
    const { listing } = confirmState;
    try {
      await updateListing({
        id: listing.id,
        body: { published: !listing.published },
      }).unwrap();
      toast.success(!listing.published ? "Published" : "Unpublished");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function runDeleteListing() {
    if (!confirmState || confirmState.kind !== "delete") return;
    try {
      await deleteListing(confirmState.listing.id).unwrap();
      toast.success("Deleted");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  const toggleOpen =
    confirmState?.kind === "toggle" ? confirmState.listing : null;
  const deleteOpen =
    confirmState?.kind === "delete" ? confirmState.listing : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ConfirmDialog
        open={Boolean(toggleOpen)}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
        title={
          toggleOpen?.published ? "Unpublish listing?" : "Publish listing?"
        }
        description={
          toggleOpen?.published
            ? "Tenants will no longer see this listing in search until you publish it again."
            : "This listing will appear in tenant search."
        }
        confirmLabel={toggleOpen?.published ? "Unpublish" : "Publish"}
        onConfirm={() => void runTogglePublished()}
      />
      <ConfirmDialog
        open={Boolean(deleteOpen)}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
        title="Delete this listing?"
        description="This removes the advert. It does not delete the property or room."
        confirmLabel="Delete listing"
        variant="destructive"
        onConfirm={() => void runDeleteListing()}
      />
      <PageHeader
        title="My listings"
        description="Publish to appear in tenant search."
        action={
          <Button variant="primary" size="sm" asChild>
            <Link href="/landlord/listings/new">New listing</Link>
          </Button>
        }
      />
      {isLoading && <p className="text-sm text-muted">Loading…</p>}
      <ul className="space-y-3">
        {data?.data?.map((l) => (
          <li key={l.id}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{l.title}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  <span>
                    £{Number(l.rentAmount).toFixed(2)}/
                    {rentAmountSuffix(l.rentFrequency)}
                  </span>
                  <StatusBadge
                    status={l.published ? "Published" : "Draft"}
                  />
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={saving}
                  onClick={() => setConfirmState({ kind: "toggle", listing: l })}
                >
                  {l.published ? "Unpublish" : "Publish"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={del}
                  onClick={() => setConfirmState({ kind: "delete", listing: l })}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {!isLoading && data?.data?.length === 0 && (
        <p className="text-sm text-muted">No listings yet.</p>
      )}
    </div>
  );
}

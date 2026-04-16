"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useCreateOrGetListingForRoomMutation,
  useUpdateListingMutation,
} from "@/lib/api/endpoints/listing.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import type { Listing, Room } from "@/lib/types/entities";

export function RoomListingSubRow({
  room,
  listing,
}: {
  room: Room;
  listing?: Listing | null;
}) {
  const [createOrGet, { isLoading: creating }] =
    useCreateOrGetListingForRoomMutation();
  const [updateListing, { isLoading: saving }] = useUpdateListingMutation();
  const [confirmToggle, setConfirmToggle] = useState<Listing | null>(null);

  async function ensureListing() {
    try {
      await createOrGet(room.id).unwrap();
      toast.success("Listing created — you can publish when ready.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function runTogglePublished() {
    if (!confirmToggle) return;
    try {
      await updateListing({
        id: confirmToggle.id,
        body: { published: !confirmToggle.published },
      }).unwrap();
      toast.success(!confirmToggle.published ? "Published" : "Unpublished");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setConfirmToggle(null);
    }
  }

  const busy = creating || saving;
  const statusLabel = !listing
    ? "No listing"
    : listing.published
      ? "Published"
      : "Draft";

  return (
    <>
      <ConfirmDialog
        open={confirmToggle != null}
        onOpenChange={(open) => {
          if (!open) setConfirmToggle(null);
        }}
        title={
          confirmToggle?.published ? "Unpublish listing?" : "Publish listing?"
        }
        description={
          confirmToggle?.published
            ? "Tenants will no longer see this room’s advert in search until you publish again."
            : "This room’s listing will appear in tenant search."
        }
        confirmLabel={confirmToggle?.published ? "Unpublish" : "Publish"}
        onConfirm={() => void runTogglePublished()}
      />
      <tr className="border-b border-border/80 bg-muted/15 last:border-0">
        <td colSpan={6} className="px-2 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Room listing</span>
              <StatusBadge status={statusLabel} />
              {listing && (
                <span className="max-w-[min(100%,20rem)] truncate text-muted">
                  {listing.title}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {!listing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => void ensureListing()}
                >
                  {creating ? "Creating…" : "Create listing"}
                </Button>
              )}
              {listing && (
                <>
                  <Button
                    type="button"
                    variant={listing.published ? "outline" : "primary"}
                    size="sm"
                    disabled={busy}
                    onClick={() => setConfirmToggle(listing)}
                  >
                    {listing.published ? "Unpublish" : "Publish"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}

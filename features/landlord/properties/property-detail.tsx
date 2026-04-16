"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTableHeader } from "@/components/table/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetListingsByPropertyQuery } from "@/lib/api/endpoints/listing.endpoints";
import {
  useCreateRoomMutation,
  useDeletePropertyMutation,
  useDeleteRoomMutation,
  useGetPropertyQuery,
  useGetRoomsQuery,
  useUpdateRoomMutation,
} from "@/lib/api/endpoints/property.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import {
  isHmoPropertyType,
  RENT_FREQUENCIES,
  rentAmountSuffix,
} from "@/lib/forms/property-constants";
import { cn } from "@/lib/utils/cn";
import { RoomListingSubRow } from "@/features/landlord/properties/room-listing-subrow";
import type { Listing, Room } from "@/lib/types/entities";
import type { ColumnDef } from "@tanstack/react-table";

const selectLikeInput =
  "flex h-10 w-full rounded-md border border-[var(--border-design)] bg-card px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background";

function RoomEditor({ propertyId, room }: { propertyId: string; room: Room }) {
  const [edit, setEdit] = useState(false);
  const [roomNumber, setRoomNumber] = useState(room.roomNumber);
  const [rentAmount, setRentAmount] = useState(String(room.rentAmount));
  const [rentFrequency, setRentFrequency] = useState(
    room.rentFrequency &&
      RENT_FREQUENCIES.includes(
        room.rentFrequency as (typeof RENT_FREQUENCIES)[number]
      )
      ? room.rentFrequency
      : "Monthly"
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [areaSqM, setAreaSqM] = useState(
    room.areaSqM != null ? String(room.areaSqM) : ""
  );
  const [description, setDescription] = useState(room.description ?? "");
  const [allowsMultipleTenants, setAllowsMultipleTenants] = useState(
    Boolean(room.allowsMultipleTenants)
  );
  const [maxTenants, setMaxTenants] = useState(
    String(room.maxTenants ?? (room.allowsMultipleTenants ? 2 : 1))
  );
  const [updateRoom, { isLoading }] = useUpdateRoomMutation();
  const [deleteRoom, { isLoading: deleting }] = useDeleteRoomMutation();

  async function save() {
    try {
      await updateRoom({
        propertyId,
        roomId: room.id,
        body: {
          roomNumber,
          rentAmount: Number(rentAmount),
          rentFrequency,
          areaSqM: areaSqM.trim() ? Number(areaSqM) : undefined,
          description: description.trim() || undefined,
          allowsMultipleTenants,
          maxTenants: allowsMultipleTenants ? Number(maxTenants || 2) : 1,
        },
      }).unwrap();
      toast.success("Room updated");
      setEdit(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function remove() {
    try {
      await deleteRoom({ propertyId, roomId: room.id }).unwrap();
      toast.success("Room deleted");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  if (!edit) {
    return (
      <>
        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title="Delete this room?"
          description="This cannot be undone. Remove the room only if it is no longer used."
          confirmLabel="Delete room"
          variant="destructive"
          onConfirm={() => void remove()}
        />
        <tr className="border-b border-border/80 last:border-0">
          <td className="py-2 pr-2 font-medium">{room.roomNumber}</td>
          <td className="py-2 pr-2">
            £{Number(room.rentAmount).toFixed(2)}/
            {rentAmountSuffix(room.rentFrequency)}
          </td>
          <td className="py-2 pr-2 text-sm text-muted">
            {room.areaSqM != null ? `${room.areaSqM} m²` : "—"}
          </td>
          <td className="py-2 pr-2 text-sm text-muted">
            {room.allowsMultipleTenants
              ? `Yes (max ${room.maxTenants ?? 2})`
              : "No"}
          </td>
          <td className="py-2 pr-2 text-sm text-muted">{room.status}</td>
          <td className="py-2 text-right">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEdit(true)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={deleting}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              Delete
            </Button>
          </td>
        </tr>
      </>
    );
  }

  return (
    <tr className="border-b border-border/80 bg-muted/30 last:border-0">
      <td className="py-2 pr-2 align-top">
        <Input
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          className="h-8"
        />
      </td>
      <td className="py-2 pr-2 align-top">
        <div className="flex flex-col gap-1">
          <Input
            type="number"
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            className="h-8"
          />
          <select
            className="h-8 rounded-md border border-border bg-background px-2 text-xs"
            value={rentFrequency}
            onChange={(e) => setRentFrequency(e.target.value)}
          >
            {RENT_FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </td>
      <td className="py-2 pr-2 align-top">
        <Input
          type="number"
          value={areaSqM}
          onChange={(e) => setAreaSqM(e.target.value)}
          className="h-8"
          placeholder="m²"
        />
      </td>
      <td className="py-2 pr-2 align-top">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowsMultipleTenants}
              onChange={(e) => setAllowsMultipleTenants(e.target.checked)}
            />
            Multi
          </label>
          {allowsMultipleTenants && (
            <Input
              type="number"
              min={2}
              value={maxTenants}
              onChange={(e) => setMaxTenants(e.target.value)}
              className="h-8"
              placeholder="Max tenants"
            />
          )}
        </div>
      </td>
      <td className="py-2 pr-2 align-top text-xs text-muted">
        {room.status}
        <p className="mt-1 max-w-[10rem] leading-snug">
          Set from tenancies. Maintenance is admin-only.
        </p>
      </td>
      <td className="py-2 text-right align-top">
        <div className="mb-2 text-left">
          <Label className="text-xs text-muted">Description</Label>
          <textarea
            className="mt-1 w-full min-w-[12rem] rounded-md border border-border bg-background px-2 py-1 text-sm"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isLoading}
          onClick={() => void save()}
        >
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setEdit(false);
            setRoomNumber(room.roomNumber);
            setRentAmount(String(room.rentAmount));
            setRentFrequency(
              room.rentFrequency &&
                RENT_FREQUENCIES.includes(
                  room.rentFrequency as (typeof RENT_FREQUENCIES)[number]
                )
                ? room.rentFrequency
                : "Monthly"
            );
            setAreaSqM(room.areaSqM != null ? String(room.areaSqM) : "");
            setDescription(room.description ?? "");
            setAllowsMultipleTenants(Boolean(room.allowsMultipleTenants));
            setMaxTenants(
              String(room.maxTenants ?? (room.allowsMultipleTenants ? 2 : 1))
            );
          }}
        >
          Cancel
        </Button>
      </td>
    </tr>
  );
}

function AddRoomForm({ propertyId }: { propertyId: string }) {
  const [roomNumber, setRoomNumber] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [areaSqM, setAreaSqM] = useState("");
  const [description, setDescription] = useState("");
  const [allowsMultipleTenants, setAllowsMultipleTenants] = useState(false);
  const [maxTenants, setMaxTenants] = useState("2");
  const [rentFrequency, setRentFrequency] =
    useState<(typeof RENT_FREQUENCIES)[number]>("Monthly");
  const [createRoom, { isLoading }] = useCreateRoomMutation();

  async function add() {
    if (!roomNumber || !rentAmount) {
      toast.error("Room number and rent are required");
      return;
    }
    try {
      await createRoom({
        propertyId,
        body: {
          roomNumber,
          rentAmount: Number(rentAmount),
          rentFrequency,
          areaSqM: areaSqM.trim() ? Number(areaSqM) : undefined,
          description: description.trim() || undefined,
          allowsMultipleTenants,
          maxTenants: allowsMultipleTenants ? Number(maxTenants || 2) : 1,
        },
      }).unwrap();
      toast.success("Room added");
      setRoomNumber("");
      setRentAmount("");
      setRentFrequency("Monthly");
      setAreaSqM("");
      setDescription("");
      setAllowsMultipleTenants(false);
      setMaxTenants("2");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <Card className="mt-6 border-dashed border-[var(--border-strong)] bg-[var(--paper-2)]/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Add a room</CardTitle>
        <CardDescription>
          Room label and rent are required. Rent frequency, size, and description
          are optional but help listings and tenancies stay accurate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-room-number">Room</Label>
            <Input
              id="new-room-number"
              placeholder="e.g. 1 or A"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-room-rent">Rent (£)</Label>
            <Input
              id="new-room-rent"
              type="number"
              min={0}
              step="0.01"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-room-frequency">Rent frequency</Label>
            <select
              id="new-room-frequency"
              className={cn(selectLikeInput)}
              value={rentFrequency}
              onChange={(e) =>
                setRentFrequency(
                  e.target.value as (typeof RENT_FREQUENCIES)[number]
                )
              }
            >
              {RENT_FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-room-area">Area (m²)</Label>
            <Input
              id="new-room-area"
              type="number"
              min={0}
              step="0.1"
              value={areaSqM}
              onChange={(e) => setAreaSqM(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                className="size-4 rounded border border-input accent-primary"
                checked={allowsMultipleTenants}
                onChange={(e) => setAllowsMultipleTenants(e.target.checked)}
              />
              Allow multiple tenants in this room
            </label>
          </div>
          {allowsMultipleTenants && (
            <div className="space-y-1.5">
              <Label htmlFor="new-room-max">Max tenants</Label>
              <Input
                id="new-room-max"
                type="number"
                min={2}
                value={maxTenants}
                onChange={(e) => setMaxTenants(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-room-desc">Description</Label>
          <Input
            id="new-room-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional — shown on listings if you use them"
          />
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isLoading}
          onClick={() => void add()}
        >
          {isLoading ? "Adding…" : "Add room"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function PropertyDetail({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetPropertyQuery(propertyId);
  const pType = data?.data?.propertyType;
  const { data: roomsData, isLoading: roomsLoading } = useGetRoomsQuery(
    {
      propertyId,
      page: 1,
      limit: 100,
    },
    { skip: !pType || !isHmoPropertyType(pType) }
  );
  const hmoForListings = Boolean(pType && isHmoPropertyType(pType));
  const { data: listingsByProp } = useGetListingsByPropertyQuery(propertyId, {
    skip: !hmoForListings,
  });
  const listingByRoomId = useMemo(() => {
    const m: Record<string, Listing> = {};
    for (const l of listingsByProp?.data ?? []) {
      if (l.roomId) m[l.roomId] = l;
    }
    return m;
  }, [listingsByProp]);
  const [deleteProperty, { isLoading: deleting }] = useDeletePropertyMutation();
  const [confirmDeletePropertyOpen, setConfirmDeletePropertyOpen] =
    useState(false);

  const roomTableColumns = useMemo<ColumnDef<Room>[]>(
    () => [
      { id: "room", header: "Room" },
      { id: "rent", header: "Rent" },
      { id: "area", header: "Area" },
      { id: "multi", header: "Multi" },
      { id: "status", header: "Status" },
      {
        id: "actions",
        header: "Actions",
        meta: { headerClassName: "text-right" },
      },
    ],
    []
  );

  const p = data?.data;

  async function removeProperty() {
    if (!p) return;
    try {
      await deleteProperty(p.id).unwrap();
      toast.success("Property deleted");
      router.push("/landlord/properties");
      router.refresh();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }
  if (isError || !p) {
    return <p className="text-sm text-destructive">Property not found.</p>;
  }

  const hmo = isHmoPropertyType(p.propertyType);
  const title = p.displayName?.trim() || p.address;

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={confirmDeletePropertyOpen}
        onOpenChange={setConfirmDeletePropertyOpen}
        title="Delete this property?"
        description="This removes the property and its rooms from your account. Listings and records tied to it may be affected."
        confirmLabel="Delete property"
        variant="destructive"
        onConfirm={() => void removeProperty()}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            <Link href="/landlord/properties" className="hover:text-primary">
              Properties
            </Link>
            <span className="mx-1">/</span>
            <span>{p.address}</span>
          </p>
          <h1 className="font-serif text-[1.9rem] font-normal leading-tight tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>
              {p.city}, {p.postcode} · {p.propertyType}
            </span>
            <StatusBadge status={p.status} />
          </p>
          {!hmo &&
            (p.headlineRentAmount != null ||
              p.headlineDepositAmount != null) && (
              <p className="mt-1 text-sm">
                {p.headlineRentAmount != null && (
                  <span className="mr-3">
                    Rent £{Number(p.headlineRentAmount).toFixed(2)}/
                    {rentAmountSuffix(p.headlineRentFrequency)}
                  </span>
                )}
                {p.headlineDepositAmount != null && (
                  <span>
                    Deposit £{Number(p.headlineDepositAmount).toFixed(2)}
                  </span>
                )}
              </p>
            )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/landlord/listings/new?propertyId=${p.id}`}>
              New listing
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/landlord/properties/${p.id}/edit`}>
              Edit property
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={deleting}
            onClick={() => setConfirmDeletePropertyOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {!hmo && p.description?.trim() && (
        <Card>
          <CardHeader>
            <CardTitle>Listing summary</CardTitle>
            <CardDescription>Whole-property let details</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{p.description}</p>
          </CardContent>
        </Card>
      )}

      {hmo ? (
        <Card>
          <CardHeader>
            <CardTitle>Rooms</CardTitle>
            <CardDescription>
              Manage rooms and rent. Terms are locked while a tenancy is active
              or pending on that room.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roomsLoading && (
              <p className="text-sm text-muted">Loading rooms…</p>
            )}
            {roomsData?.data && roomsData.data.length === 0 && (
              <p className="text-sm text-muted">No rooms yet.</p>
            )}
            {roomsData?.data && roomsData.data.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <DataTableHeader columns={roomTableColumns} />
                  <tbody>
                    {roomsData.data.map((r) => (
                      <Fragment key={r.id}>
                        <RoomEditor
                          propertyId={propertyId}
                          room={r}
                        />
                        <RoomListingSubRow
                          room={r}
                          listing={listingByRoomId[r.id]}
                        />
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <AddRoomForm propertyId={propertyId} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Whole property</CardTitle>
            <CardDescription>
              This type does not use a room grid. Create tenancies against the
              property ID (see Tenants).
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

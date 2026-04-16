"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LandlordPropertyRoomSelect } from "@/components/forms/landlord-property-selects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateListingMutation } from "@/lib/api/endpoints/listing.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import {
  useGetPropertiesQuery,
  useGetRoomsQuery,
} from "@/lib/api/endpoints/property.endpoints";
import {
  isHmoPropertyType,
  RENT_FREQUENCIES,
} from "@/lib/forms/property-constants";
import type { Property, Room } from "@/lib/types/entities";

function numToInputString(v: number | string | undefined | null): string {
  if (v === undefined || v === null) return "";
  const n = typeof v === "string" ? Number(v) : v;
  if (Number.isNaN(n)) return "";
  return String(n);
}

function propertyListingLabel(p: Property): string {
  const name = p.displayName?.trim();
  return name ? name : `${p.address}, ${p.city}`;
}

function applyListingDefaultsFromSelection(args: {
  property: Property;
  isHmo: boolean;
  room: Room | undefined;
}): {
  title: string;
  summary: string;
  rentAmount: string;
  depositAmount: string;
  rentFrequency: string;
} {
  const { property, isHmo, room } = args;
  const deposit = numToInputString(property.headlineDepositAmount);
  const propDesc = property.description?.trim() ?? "";
  const propFreq =
    property.headlineRentFrequency &&
    RENT_FREQUENCIES.includes(
      property.headlineRentFrequency as (typeof RENT_FREQUENCIES)[number]
    )
      ? property.headlineRentFrequency
      : "Monthly";

  if (isHmo) {
    if (!room) {
      return {
        title: "",
        summary: propDesc,
        rentAmount: "",
        depositAmount: deposit,
        rentFrequency: "Monthly",
      };
    }
    const base = propertyListingLabel(property);
    const roomBits = [room.description?.trim(), propDesc].filter(Boolean);
    const roomFreq =
      room.rentFrequency &&
      RENT_FREQUENCIES.includes(
        room.rentFrequency as (typeof RENT_FREQUENCIES)[number]
      )
        ? room.rentFrequency
        : "Monthly";
    return {
      title: `Room ${room.roomNumber} — ${base}`,
      summary: roomBits.join("\n\n"),
      rentAmount: numToInputString(room.rentAmount),
      depositAmount: deposit,
      rentFrequency: roomFreq,
    };
  }

  return {
    title: propertyListingLabel(property),
    summary: propDesc,
    rentAmount: numToInputString(property.headlineRentAmount),
    depositAmount: deposit,
    rentFrequency: propFreq,
  };
}

type ListingFormOverrides = {
  title?: string;
  summary?: string;
  rentAmount?: string;
  rentFrequency?: (typeof RENT_FREQUENCIES)[number];
  depositAmount?: string;
};

function normalizeRentFrequency(
  value: string | undefined
): (typeof RENT_FREQUENCIES)[number] {
  return RENT_FREQUENCIES.includes(value as (typeof RENT_FREQUENCIES)[number])
    ? (value as (typeof RENT_FREQUENCIES)[number])
    : "Monthly";
}

export default function NewListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createListing, { isLoading }] = useCreateListingMutation();
  const { data: propsData } = useGetPropertiesQuery({ page: 1, limit: 100 });
  const properties = propsData?.data ?? [];

  const [propertyId, setPropertyId] = useState(
    searchParams.get("propertyId") ?? ""
  );
  const [roomId, setRoomId] = useState(searchParams.get("roomId") ?? "");
  const [overrides, setOverrides] = useState<ListingFormOverrides>({});
  const [published, setPublished] = useState(false);

  const selectedProp = properties.find((p) => p.id === propertyId);
  const isHmo = selectedProp
    ? isHmoPropertyType(selectedProp.propertyType)
    : false;

  const { data: roomsData } = useGetRoomsQuery(
    { propertyId, limit: 100 },
    { skip: !propertyId || !isHmo }
  );
  const roomsFromApi = useMemo(() => roomsData?.data ?? [], [roomsData?.data]);

  const selectedRoom = useMemo(() => {
    if (!roomId || !isHmo) return undefined;
    const fromProp = selectedProp?.rooms?.find((r) => r.id === roomId);
    if (fromProp) return fromProp;
    return roomsFromApi.find((r) => r.id === roomId);
  }, [roomId, isHmo, selectedProp?.rooms, roomsFromApi]);

  const defaults = useMemo(() => {
    if (!selectedProp) {
      return {
        title: "",
        summary: "",
        rentAmount: "",
        depositAmount: "",
        rentFrequency: "Monthly" as (typeof RENT_FREQUENCIES)[number],
      };
    }
    const next = applyListingDefaultsFromSelection({
      property: selectedProp,
      isHmo,
      room: selectedRoom,
    });
    return {
      ...next,
      rentFrequency: normalizeRentFrequency(next.rentFrequency),
    };
  }, [selectedProp, isHmo, selectedRoom]);

  const title = overrides.title ?? defaults.title;
  const summary = overrides.summary ?? defaults.summary;
  const rentAmount = overrides.rentAmount ?? defaults.rentAmount;
  const rentFrequency = overrides.rentFrequency ?? defaults.rentFrequency;
  const depositAmount = overrides.depositAmount ?? defaults.depositAmount;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyId.trim() || !title.trim() || !rentAmount.trim()) {
      toast.error("Property, title, and rent are required");
      return;
    }
    if (isHmo && !roomId.trim()) {
      toast.error("Choose a room for HMO listings");
      return;
    }
    if (!isHmo && roomId.trim()) {
      toast.error("Do not select a room for non-HMO properties");
      return;
    }
    const body: Record<string, unknown> = {
      propertyId: propertyId.trim(),
      title: title.trim(),
      summary: summary.trim() || undefined,
      rentAmount: Number(rentAmount),
      rentFrequency,
      published,
    };
    if (roomId.trim()) body.roomId = roomId.trim();
    const dep = depositAmount.trim();
    if (dep) body.depositAmount = Number(dep);
    try {
      await createListing(body).unwrap();
      toast.success("Listing created");
      router.push("/landlord/listings");
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <p className="text-sm text-muted">
        <Link href="/landlord/listings" className="hover:text-primary">
          Listings
        </Link>
        <span className="mx-1">/</span>
        <span>New</span>
      </p>
      <Card>
        <CardHeader>
          <CardTitle>New listing</CardTitle>
          <CardDescription>
            Pick a property (and room for HMO). Title, rent, deposit, and
            summary are filled from your property/room records — edit before
            saving if you want different advert text or amounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <LandlordPropertyRoomSelect
              propertyId={propertyId}
              roomId={roomId}
              onPropertyIdChange={(nextPropertyId) => {
                setPropertyId(nextPropertyId);
                setRoomId("");
                setOverrides({});
              }}
              onRoomIdChange={(nextRoomId) => {
                setRoomId(nextRoomId);
                setOverrides({});
              }}
              requireRoomForHmo
            />
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) =>
                  setOverrides((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="summary">Summary</Label>
              <textarea
                id="summary"
                className="min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={summary}
                onChange={(e) =>
                  setOverrides((prev) => ({ ...prev, summary: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rent">Rent £</Label>
              <Input
                id="rent"
                type="number"
                value={rentAmount}
                onChange={(e) =>
                  setOverrides((prev) => ({
                    ...prev,
                    rentAmount: e.target.value,
                  }))
                }
                required
              />
              <div className="mt-2 space-y-1">
                <Label htmlFor="rentFrequency" className="text-xs text-muted">
                  Rent period
                </Label>
                <select
                  id="rentFrequency"
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={rentFrequency}
                  onChange={(e) =>
                    setOverrides((prev) => ({
                      ...prev,
                      rentFrequency: e.target
                        .value as (typeof RENT_FREQUENCIES)[number],
                    }))
                  }
                >
                  {RENT_FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="deposit">Deposit £ (optional)</Label>
              <Input
                id="deposit"
                type="number"
                value={depositAmount}
                onChange={(e) =>
                  setOverrides((prev) => ({
                    ...prev,
                    depositAmount: e.target.value,
                  }))
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Publish immediately
            </label>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Saving…" : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

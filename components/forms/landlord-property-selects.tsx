"use client";

import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  useGetPropertiesQuery,
  useGetRoomsQuery,
} from "@/lib/api/endpoints/property.endpoints";
import {
  isHmoPropertyType,
  rentAmountSuffix,
} from "@/lib/forms/property-constants";

function formatPropertyOption(p: {
  displayName?: string | null;
  address: string;
  city: string;
}) {
  const name = p.displayName?.trim();
  return name ? `${name} — ${p.city}` : `${p.address}, ${p.city}`;
}

export function LandlordPropertySelect({
  value,
  onChange,
  id = "property-select",
  label = "Property",
  className,
}: {
  value: string;
  onChange: (propertyId: string) => void;
  id?: string;
  label?: string;
  className?: string;
}) {
  const { data, isLoading } = useGetPropertiesQuery({ page: 1, limit: 100 });

  return (
    <div className={className ?? "space-y-1"}>
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <select
        id={id}
        className="flex h-10 w-full min-w-[200px] rounded-md border border-border bg-background px-2 text-sm"
        value={value}
        disabled={isLoading}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{isLoading ? "Loading…" : "Select property"}</option>
        {(data?.data ?? []).map((p) => (
          <option key={p.id} value={p.id}>
            {formatPropertyOption(p)}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Property dropdown plus room dropdown when the selected property is HMO.
 */
export function LandlordPropertyRoomSelect({
  propertyId,
  roomId,
  onPropertyIdChange,
  onRoomIdChange,
  requireRoomForHmo,
  propertyLabel = "Property",
  roomLabel = "Room",
  roomPlaceholder = "Select room",
}: {
  propertyId: string;
  roomId: string;
  onPropertyIdChange: (id: string) => void;
  onRoomIdChange: (id: string) => void;
  /** When true, room list is shown for HMO and must be chosen before submit. */
  requireRoomForHmo: boolean;
  propertyLabel?: string;
  roomLabel?: string;
  roomPlaceholder?: string;
}) {
  const { data: propsData, isLoading: propsLoading } = useGetPropertiesQuery({
    page: 1,
    limit: 100,
  });
  const properties = propsData?.data ?? [];
  const selected = properties.find((p) => p.id === propertyId);
  const isHmo = selected ? isHmoPropertyType(selected.propertyType) : false;
  const showRooms = requireRoomForHmo && isHmo && Boolean(propertyId);

  const { data: roomsData, isLoading: roomsLoading } = useGetRoomsQuery(
    { propertyId, limit: 100 },
    { skip: !showRooms },
  );
  const rooms = roomsData?.data ?? [];

  useEffect(() => {
    onRoomIdChange("");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset room when property changes
  }, [propertyId]);

  return (
    <>
      <div className="space-y-1">
        <Label className="text-xs">{propertyLabel}</Label>
        <select
          className="flex h-10 w-full min-w-[200px] rounded-md border border-border bg-background px-2 text-sm"
          value={propertyId}
          disabled={propsLoading}
          onChange={(e) => onPropertyIdChange(e.target.value)}
        >
          <option value="">
            {propsLoading ? "Loading…" : "Select property"}
          </option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {formatPropertyOption(p)}
            </option>
          ))}
        </select>
      </div>
      {showRooms ? (
        <div className="space-y-1">
          <Label className="text-xs">{roomLabel}</Label>
          <select
            className="flex h-10 w-full min-w-[200px] rounded-md border border-border bg-background px-2 text-sm"
            value={roomId}
            disabled={roomsLoading}
            onChange={(e) => onRoomIdChange(e.target.value)}
          >
            <option value="">
              {roomsLoading ? "Loading…" : roomPlaceholder}
            </option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {`Room ${r.roomNumber} — £${Number(r.rentAmount).toFixed(2)}/${rentAmountSuffix(r.rentFrequency)}`}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </>
  );
}

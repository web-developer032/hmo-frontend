import type { Tenancy } from "@/lib/types/entities";

/** Human-readable line for selects and tables (no raw UUID). */
export function formatTenancySummary(tenancy: Tenancy): string {
  const tenant =
    tenancy.tenantProfile?.fullName?.trim() || "Tenant";
  const prop =
    tenancy.room?.property?.displayName?.trim() ||
    tenancy.room?.property?.address ||
    tenancy.property?.displayName?.trim() ||
    tenancy.property?.address ||
    "Property";
  const roomPart =
    tenancy.roomId && tenancy.room?.roomNumber != null
      ? ` · Room ${tenancy.room.roomNumber}`
      : tenancy.roomId
        ? " · Room"
        : " · Whole property";
  const start = String(tenancy.startDate).slice(0, 10);
  return `${tenant} · ${prop}${roomPart} · from ${start}`;
}

/** Property + room line for chat thread titles (matches backend messaging labels). */
export function formatTenancyChatTitle(tenancy: Tenancy): string {
  const prop =
    tenancy.room?.property?.displayName?.trim() ||
    tenancy.room?.property?.address ||
    tenancy.property?.displayName?.trim() ||
    tenancy.property?.address ||
    "Property";
  const roomPart =
    tenancy.roomId && tenancy.room?.roomNumber != null
      ? ` · Room ${tenancy.room.roomNumber}`
      : tenancy.roomId
        ? " · Room"
        : " · Whole property";
  return `${prop}${roomPart}`;
}

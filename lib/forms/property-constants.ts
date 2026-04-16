/** Match Backend `property.dto` / `room.dto` enum display values. */
export const PROPERTY_TYPES = [
  "HMO House",
  "House",
  "Flat",
  "Bungalow",
  "Cottage",
  "Cabin",
  "Studio",
  "Apartment",
  "Studio unit",
] as const;

export const PROPERTY_STATUSES = ["Active", "Idle", "Maintenance"] as const;

export const ROOM_STATUSES = ["Available", "Occupied", "Maintenance"] as const;

/** Match backend `RentFrequency` enum display values. */
export const RENT_FREQUENCIES = ["Weekly", "Monthly"] as const;

export function rentAmountSuffix(frequency: string | undefined): string {
  return frequency === "Weekly" ? "wk" : "mo";
}

export function rentPeriodLabel(frequency: string | undefined): string {
  return frequency === "Weekly" ? "per week" : "per month";
}

/** Only `HMO House` uses the per-room grid; other types use property-level fields. */
export function isHmoPropertyType(propertyType: string): boolean {
  return propertyType === "HMO House";
}

/**
 * Single source for RTK Query tag types and helpers. Import `T`, `TID`, and helpers
 * in endpoint files; keep `HMO_TAG_TYPES` in sync with `hmoApi` `tagTypes`.
 */
export const T = {
  Auth: "Auth",
  Property: "Property",
  Room: "Room",
  Listing: "Listing",
  ListingApplication: "ListingApplication",
  TenantProfile: "TenantProfile",
  Tenancy: "Tenancy",
  RentPayment: "RentPayment",
  ComplianceRecord: "ComplianceRecord",
  HmoDocument: "HmoDocument",
  MaintenanceTicket: "MaintenanceTicket",
  HmoMessage: "HmoMessage",
  Analytics: "Analytics",
  AdminUser: "AdminUser",
  Subscription: "Subscription",
  SubscriptionPlan: "SubscriptionPlan",
} as const;

export type HmoCacheTag = (typeof T)[keyof typeof T];

export const HMO_TAG_TYPES = [
  T.Auth,
  T.Property,
  T.Room,
  T.Listing,
  T.ListingApplication,
  T.TenantProfile,
  T.Tenancy,
  T.RentPayment,
  T.ComplianceRecord,
  T.HmoDocument,
  T.MaintenanceTicket,
  T.HmoMessage,
  T.Analytics,
  T.AdminUser,
  T.Subscription,
  T.SubscriptionPlan,
] as const;

/** Standard `id` values for non-entity cache rows (lists, summaries, charts). */
export const TID = {
  LIST: "LIST",
  ME: "ME",
  SUMMARY: "SUMMARY",
  SUMMARY_STATUS: "SUMMARY_STATUS",
  EXPIRED: "EXPIRED",
  EXPIRING: "EXPIRING",
  PARTNERS: "PARTNERS",
  UNREAD: "UNREAD",
  LANDLORD_DASH: "LANDLORD_DASH",
  ADMIN_DASH: "ADMIN_DASH",
  CHART_RENT: "CHART_RENT",
  CHART_OCC: "CHART_OCC",
  CHART_INCOME: "CHART_INCOME",
} as const;

export function tagList<K extends HmoCacheTag>(
  type: K,
): [{ type: K; id: typeof TID.LIST }] {
  return [{ type, id: TID.LIST }];
}

export function tagItem<K extends HmoCacheTag>(
  type: K,
  id: string,
): [{ type: K; id: string }] {
  return [{ type, id }];
}

export function tagItems<K extends HmoCacheTag, Item extends { id: string }>(
  type: K,
  res: { data: Item[] } | undefined | null,
): Array<{ type: K; id: string }> {
  if (!res?.data?.length) {
    return [{ type, id: TID.LIST }];
  }
  return [
    ...res.data.map((item) => ({ type, id: item.id })),
    { type, id: TID.LIST },
  ];
}

export function tagItemAndList<K extends HmoCacheTag>(
  type: K,
  id: string,
): [{ type: K; id: string }, { type: K; id: typeof TID.LIST }] {
  return [{ type, id }, { type, id: TID.LIST }];
}

/** Invalidate every cache entry for these tag types (no id). */
export function invTags(...types: HmoCacheTag[]): HmoCacheTag[] {
  return types;
}

/** `providesTags` when the whole cache tag type is covered (no entity id). */
export function tagEntire<K extends HmoCacheTag>(type: K): [K] {
  return [type];
}

/** Combine tag descriptors for `providesTags` / `invalidatesTags` without manual spreads. */
export function tagMerge(
  ...parts: ReadonlyArray<{ type: HmoCacheTag; id: string }>[]
): Array<{ type: HmoCacheTag; id: string }> {
  const out: Array<{ type: HmoCacheTag; id: string }> = [];
  for (const part of parts) {
    out.push(...part);
  }
  return out;
}

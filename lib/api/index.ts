import "@/lib/api/register-endpoints";
export { hmoApi } from "@/lib/api/hmo-api";
export {
  T,
  TID,
  HMO_TAG_TYPES,
  tagList,
  tagItem,
  tagItems,
  tagItemAndList,
  invTags,
  tagEntire,
  tagMerge,
  type HmoCacheTag,
} from "@/lib/api/cache-tags";
export * from "@/lib/api/endpoints/auth.endpoints";
export * from "@/lib/api/endpoints/property.endpoints";
export * from "@/lib/api/endpoints/tenant.endpoints";
export * from "@/lib/api/endpoints/rent.endpoints";
export * from "@/lib/api/endpoints/compliance.endpoints";
export * from "@/lib/api/endpoints/document.endpoints";
export * from "@/lib/api/endpoints/maintenance.endpoints";
export * from "@/lib/api/endpoints/messaging.endpoints";
export * from "@/lib/api/endpoints/analytics.endpoints";
export * from "@/lib/api/endpoints/user.endpoints";
export * from "@/lib/api/endpoints/subscription.endpoints";
export * from "@/lib/api/endpoints/subscription-plan.endpoints";

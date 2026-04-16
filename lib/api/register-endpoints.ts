/**
 * Side-effect imports so all RTK Query endpoints are registered on `hmoApi`
 * before the Redux store is created.
 */
import "@/lib/api/endpoints/auth.endpoints";
import "@/lib/api/endpoints/property.endpoints";
import "@/lib/api/endpoints/listing.endpoints";
import "@/lib/api/endpoints/tenant.endpoints";
import "@/lib/api/endpoints/rent.endpoints";
import "@/lib/api/endpoints/compliance.endpoints";
import "@/lib/api/endpoints/document.endpoints";
import "@/lib/api/endpoints/maintenance.endpoints";
import "@/lib/api/endpoints/messaging.endpoints";
import "@/lib/api/endpoints/analytics.endpoints";
import "@/lib/api/endpoints/user.endpoints";
import "@/lib/api/endpoints/subscription.endpoints";
import "@/lib/api/endpoints/subscription-plan.endpoints";
import "@/lib/api/endpoints/landlord-profile.endpoints";
import "@/lib/api/endpoints/notification.endpoints";

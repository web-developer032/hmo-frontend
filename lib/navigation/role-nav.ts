import { Role, hasAnyRole, type RoleValue } from "@/lib/constants/roles";

export type NavItem = { href: string; label: string };

export type NavSection = { title: string; items: NavItem[] };

export type ActiveNavFilter = RoleValue | "all";

/**
 * @param activeNavRole When not `all`, only that role’s section (+ Shared) is shown for users who have it.
 */
export function getNavSectionsForUser(
  roles: string[] | undefined,
  activeNavRole: ActiveNavFilter = "all"
): NavSection[] {
  const sections: NavSection[] = [];

  const showLandlordBlock =
    activeNavRole === "all" || activeNavRole === Role.Landlord;
  const showTenantBlock =
    activeNavRole === "all" || activeNavRole === Role.Tenant;
  const showAdminBlock =
    activeNavRole === "all" || activeNavRole === Role.Admin;

  /** Landlord portfolio tools — API is landlord-scoped; admin uses /admin + platform metrics only. */
  if (showLandlordBlock && hasAnyRole(roles, [Role.Landlord])) {
    sections.push({
      title: "Landlord",
      items: [
        { href: "/landlord/profile", label: "My profile" },
        { href: "/landlord/properties", label: "Properties" },
        { href: "/landlord/listings", label: "Listings" },
        { href: "/landlord/applications", label: "Applications" },
        { href: "/landlord/tenants", label: "Tenants" },
        { href: "/landlord/rent", label: "Rent" },
        { href: "/landlord/compliance", label: "Compliance" },
        { href: "/landlord/documents", label: "Documents" },
        { href: "/landlord/maintenance", label: "Maintenance" },
      ],
    });
  }

  if (showTenantBlock && hasAnyRole(roles, [Role.Tenant])) {
    sections.push({
      title: "Tenant",
      items: [
        { href: "/tenant/profile", label: "My profile" },
        { href: "/tenant/listings", label: "Search listings" },
        { href: "/tenant/applications", label: "My applications" },
        { href: "/tenant/rent", label: "Rent" },
        { href: "/tenant/maintenance", label: "Maintenance" },
        { href: "/tenant/documents", label: "Documents" },
      ],
    });
  }

  if (showAdminBlock && hasAnyRole(roles, [Role.Admin])) {
    sections.push({
      title: "Admin",
      items: [
        { href: "/admin/users", label: "Users" },
        { href: "/admin/plans", label: "Plans" },
        { href: "/admin/subscriptions", label: "Subscriptions" },
      ],
    });
  }

  sections.push({
    title: "Shared",
    items: [
      { href: "/messages", label: "Messages" },
      { href: "/notifications", label: "Notifications" },
    ],
  });

  return sections;
}

export function shouldShowLandlordDashboardFeatures(
  roles: string[] | undefined,
  activeNavRole: ActiveNavFilter
): boolean {
  return (
    hasAnyRole(roles, [Role.Landlord]) &&
    (activeNavRole === "all" || activeNavRole === Role.Landlord)
  );
}

export function shouldShowAdminDashboardFeatures(
  roles: string[] | undefined,
  activeNavRole: ActiveNavFilter
): boolean {
  return (
    hasAnyRole(roles, [Role.Admin]) &&
    (activeNavRole === "all" || activeNavRole === Role.Admin)
  );
}

export function shouldShowTenantDashboardFeatures(
  roles: string[] | undefined,
  activeNavRole: ActiveNavFilter
): boolean {
  return (
    hasAnyRole(roles, [Role.Tenant]) &&
    (activeNavRole === "all" || activeNavRole === Role.Tenant)
  );
}

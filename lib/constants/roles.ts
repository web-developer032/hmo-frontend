/** Mirrors Backend `Role` enum — lowercase values. */
export const Role = {
  Admin: "admin",
  Landlord: "landlord",
  Tenant: "tenant",
} as const;

export type RoleValue = (typeof Role)[keyof typeof Role];

export function hasAnyRole(
  userRoles: string[] | undefined,
  allowed: readonly string[],
): boolean {
  if (!userRoles?.length) return false;
  return allowed.some((r) => userRoles.includes(r));
}

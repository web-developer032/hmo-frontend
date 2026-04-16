import { RoleRouteGuard } from "@/components/role-route-guard";
import { Role } from "@/lib/constants/roles";

export default function TenantPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleRouteGuard allowRoles={[Role.Tenant]}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </RoleRouteGuard>
  );
}

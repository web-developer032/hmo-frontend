import { RoleRouteGuard } from "@/components/role-route-guard";
import { Role } from "@/lib/constants/roles";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleRouteGuard allowRoles={[Role.Admin]}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </RoleRouteGuard>
  );
}

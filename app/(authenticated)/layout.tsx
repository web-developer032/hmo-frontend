import { ProtectedRouteGuard } from "@/components/protected-route-guard";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRouteGuard>{children}</ProtectedRouteGuard>;
}

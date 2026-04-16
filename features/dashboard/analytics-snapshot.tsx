"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetAdminDashboardMetricsQuery,
  useGetLandlordDashboardMetricsQuery,
} from "@/lib/api/endpoints/analytics.endpoints";
import {
  shouldShowAdminDashboardFeatures,
  shouldShowLandlordDashboardFeatures,
  type ActiveNavFilter,
} from "@/lib/navigation/role-nav";

function MetricTile({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-design)] bg-[var(--paper-2)] p-4 shadow-[var(--shadow-sm)]">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export function AnalyticsSnapshot({
  roles,
  activeNavRole = "all",
}: {
  roles: string[];
  activeNavRole?: ActiveNavFilter;
}) {
  const landlord = useGetLandlordDashboardMetricsQuery(undefined, {
    skip: !shouldShowLandlordDashboardFeatures(roles, activeNavRole),
  });
  const admin = useGetAdminDashboardMetricsQuery(undefined, {
    skip: !shouldShowAdminDashboardFeatures(roles, activeNavRole),
  });

  if (
    !shouldShowLandlordDashboardFeatures(roles, activeNavRole) &&
    !shouldShowAdminDashboardFeatures(roles, activeNavRole)
  ) {
    return null;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {shouldShowLandlordDashboardFeatures(roles, activeNavRole) && (
        <Card>
          <CardHeader>
            <CardTitle>Landlord metrics</CardTitle>
            <CardDescription>
              Live signals from the analytics API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {landlord.isLoading && (
              <p className="text-sm text-muted">Loading...</p>
            )}
            {landlord.isError && (
              <p className="text-sm text-destructive">
                Could not load landlord metrics.
              </p>
            )}
            {landlord.data?.data && (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <MetricTile
                  label="Properties"
                  value={landlord.data.data.totalProperties}
                />
                <MetricTile
                  label="Rooms"
                  value={landlord.data.data.totalRooms}
                />
                <MetricTile
                  label="Occupied"
                  value={landlord.data.data.occupiedRooms}
                />
                <MetricTile
                  label="Monthly income"
                  value={`GBP ${Number(
                    landlord.data.data.monthlyIncome
                  ).toFixed(2)}`}
                />
                <MetricTile
                  label="Outstanding rent"
                  value={`GBP ${Number(
                    landlord.data.data.outstandingRent
                  ).toFixed(2)}`}
                />
                <MetricTile
                  label="Compliance score"
                  value={Number(landlord.data.data.complianceScore).toFixed(1)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {shouldShowAdminDashboardFeatures(roles, activeNavRole) && (
        <Card>
          <CardHeader>
            <CardTitle>Platform metrics</CardTitle>
            <CardDescription>
              Admin snapshot for users and inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {admin.isLoading && (
              <p className="text-sm text-muted">Loading...</p>
            )}
            {admin.isError && (
              <p className="text-sm text-destructive">
                Could not load platform metrics.
              </p>
            )}
            {admin.data?.data && (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <MetricTile label="Users" value={admin.data.data.totalUsers} />
                <MetricTile
                  label="Landlords"
                  value={admin.data.data.totalLandlords}
                />
                <MetricTile
                  label="Tenants"
                  value={admin.data.data.totalTenants}
                />
                <MetricTile
                  label="Properties"
                  value={admin.data.data.totalProperties}
                />
                <MetricTile label="Rooms" value={admin.data.data.totalRooms} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

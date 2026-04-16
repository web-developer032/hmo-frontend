"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MiniBarChart, MiniLineChart } from "@/components/charts/mini-charts";
import {
  useGetAdminDashboardMetricsQuery,
  useGetIncomePerPropertyChartQuery,
  useGetOccupancyChartQuery,
  useGetRentTrendChartQuery,
} from "@/lib/api/endpoints/analytics.endpoints";
import {
  shouldShowAdminDashboardFeatures,
  shouldShowLandlordDashboardFeatures,
  type ActiveNavFilter,
} from "@/lib/navigation/role-nav";

export function ChartsPanel({
  roles,
  activeNavRole = "all",
}: {
  roles: string[];
  activeNavRole?: ActiveNavFilter;
}) {
  const skipLandlord = !shouldShowLandlordDashboardFeatures(
    roles,
    activeNavRole,
  );
  const skipAdmin = !shouldShowAdminDashboardFeatures(roles, activeNavRole);

  const rent = useGetRentTrendChartQuery({ timeRange: "Quarter" }, {
    skip: skipLandlord,
  });
  const occ = useGetOccupancyChartQuery({ timeRange: "Quarter" }, {
    skip: skipLandlord,
  });
  const income = useGetIncomePerPropertyChartQuery(
    { timeRange: "Quarter" },
    { skip: skipLandlord },
  );
  const adminMetrics = useGetAdminDashboardMetricsQuery(undefined, {
    skip: skipAdmin,
  });

  const rentPts = rent.data?.data ?? [];
  const occPts = occ.data?.data ?? [];

  return (
    <div className="space-y-6">
      {!skipLandlord && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Rent trends</CardTitle>
              <CardDescription>
                Received rent by day (quarter, downsampled for readability).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rent.isLoading && <p className="text-sm text-muted">Loading…</p>}
              {!rent.isLoading && rentPts.length > 0 && (
                <MiniLineChart
                  values={rentPts.map((p) => Number(p.amount))}
                  labels={rentPts.map((p) => p.date)}
                />
              )}
              <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-muted">
                {rentPts.slice(-8).map((p) => (
                  <li
                    key={p.date}
                    className="flex justify-between border-b border-border/50 py-1 last:border-0"
                  >
                    <span>{p.date}</span>
                    <span className="font-medium text-foreground">
                      £{Number(p.amount).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Occupancy rate</CardTitle>
              <CardDescription>
                Portfolio occupancy over the quarter (sampled points — not every
                calendar day).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {occ.isLoading && <p className="text-sm text-muted">Loading…</p>}
              {!occ.isLoading && occPts.length > 0 && (
                <MiniLineChart
                  values={occPts.map((p) => Number(p.occupancyRate))}
                  labels={occPts.map((p) => p.date)}
                  stroke="var(--accent)"
                />
              )}
              <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-muted">
                {occPts.slice(-8).map((p) => (
                  <li
                    key={p.date}
                    className="flex justify-between border-b border-border/50 py-1 last:border-0"
                  >
                    <span>{p.date}</span>
                    <span className="font-medium text-foreground">
                      {Number(p.occupancyRate).toFixed(0)}% (
                      {p.occupiedRooms}/{p.totalRooms} rooms)
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Income by property</CardTitle>
              <CardDescription>
                Relative share of rent recorded in the period.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {income.isLoading && (
                <p className="text-sm text-muted">Loading…</p>
              )}
              {!income.isLoading &&
                (income.data?.data?.length ? (
                  <MiniBarChart
                    items={(income.data?.data ?? []).map((p) => ({
                      label: p.propertyName,
                      value: Number(p.totalIncome),
                    }))}
                    labelKey="label"
                    valueKey="value"
                  />
                ) : (
                  <p className="text-sm text-muted">No property income yet.</p>
                ))}
            </CardContent>
          </Card>
        </div>
      )}

      {!skipAdmin && adminMetrics.data?.data && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Platform users</CardTitle>
              <CardDescription>
                Counts from the admin analytics API (useful for capacity and
                support planning).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MiniBarChart
                items={[
                  {
                    label: "All users",
                    value: adminMetrics.data.data.totalUsers,
                  },
                  {
                    label: "Landlords",
                    value: adminMetrics.data.data.totalLandlords,
                  },
                  {
                    label: "Tenants",
                    value: adminMetrics.data.data.totalTenants,
                  },
                ]}
                color="var(--blue)"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Platform inventory</CardTitle>
              <CardDescription>
                Properties and rooms registered on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MiniBarChart
                items={[
                  {
                    label: "Properties",
                    value: adminMetrics.data.data.totalProperties,
                  },
                  {
                    label: "Rooms",
                    value: adminMetrics.data.data.totalRooms,
                  },
                ]}
                color="var(--amber)"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

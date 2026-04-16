import { T, TID, tagItem } from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiSuccess } from "@/lib/api/types";
import type {
  IncomePerPropertyChartPoint,
  LandlordDashboardMetrics,
  OccupancyChartPoint,
  PlatformAdminMetrics,
  RentTrendChartPoint,
} from "@/lib/types/entities";

export const analyticsApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    getLandlordDashboardMetrics: builder.query<
      ApiSuccess<LandlordDashboardMetrics>,
      void
    >({
      query: () => ({
        url: "analytics/dashboard/landlord",
        method: "GET",
      }),
      providesTags: tagItem(T.Analytics, TID.LANDLORD_DASH),
    }),
    getAdminDashboardMetrics: builder.query<
      ApiSuccess<PlatformAdminMetrics>,
      void
    >({
      query: () => ({
        url: "analytics/dashboard/admin",
        method: "GET",
      }),
      providesTags: tagItem(T.Analytics, TID.ADMIN_DASH),
    }),
    getRentTrendChart: builder.query<
      ApiSuccess<RentTrendChartPoint[]>,
      { timeRange?: string; propertyId?: string } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.timeRange) params.set("timeRange", a.timeRange);
        if (a.propertyId) params.set("propertyId", a.propertyId);
        const q = params.toString();
        return {
          url: `analytics/charts/rent-trends${q ? `?${q}` : ""}`,
          method: "GET",
        };
      },
      providesTags: tagItem(T.Analytics, TID.CHART_RENT),
    }),
    getOccupancyChart: builder.query<
      ApiSuccess<OccupancyChartPoint[]>,
      { timeRange?: string; propertyId?: string } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.timeRange) params.set("timeRange", a.timeRange);
        if (a.propertyId) params.set("propertyId", a.propertyId);
        const q = params.toString();
        return {
          url: `analytics/charts/occupancy-rate${q ? `?${q}` : ""}`,
          method: "GET",
        };
      },
      providesTags: tagItem(T.Analytics, TID.CHART_OCC),
    }),
    getIncomePerPropertyChart: builder.query<
      ApiSuccess<IncomePerPropertyChartPoint[]>,
      { timeRange?: string } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.timeRange) params.set("timeRange", a.timeRange);
        const q = params.toString();
        return {
          url: `analytics/charts/income-per-property${q ? `?${q}` : ""}`,
          method: "GET",
        };
      },
      providesTags: tagItem(T.Analytics, TID.CHART_INCOME),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetLandlordDashboardMetricsQuery,
  useGetAdminDashboardMetricsQuery,
  useGetRentTrendChartQuery,
  useGetOccupancyChartQuery,
  useGetIncomePerPropertyChartQuery,
} = analyticsApi;

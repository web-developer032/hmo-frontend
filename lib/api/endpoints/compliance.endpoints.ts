import {
  T,
  TID,
  invTags,
  tagItem,
  tagItems,
} from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiListSuccess, ApiSuccess } from "@/lib/api/types";
import type { ComplianceRecord } from "@/lib/types/entities";

export const complianceApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    getComplianceRecords: builder.query<
      ApiListSuccess<ComplianceRecord>,
      { page?: number; limit?: number; search?: string; propertyId?: string } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.page != null) params.set("page", String(a.page));
        if (a.limit != null) params.set("limit", String(a.limit));
        if (a.search) params.set("search", a.search);
        if (a.propertyId) params.set("propertyId", a.propertyId);
        const q = params.toString();
        return {
          url: `compliance-records${q ? `?${q}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (res) => tagItems(T.ComplianceRecord, res),
    }),
    getComplianceSummary: builder.query<ApiSuccess<Record<string, unknown>>, void>(
      {
        query: () => ({
          url: "compliance-records/summary",
          method: "GET",
        }),
        providesTags: tagItem(T.ComplianceRecord, TID.SUMMARY),
      },
    ),
    getCompliancePropertyScore: builder.query<
      ApiSuccess<{ score: number }>,
      string
    >({
      query: (propertyId) => ({
        url: `compliance-records/property/${propertyId}/score`,
        method: "GET",
      }),
      providesTags: (_r, _e, propertyId) =>
        tagItem(T.ComplianceRecord, `SCORE-${propertyId}`),
    }),
    getComplianceRecord: builder.query<ApiSuccess<ComplianceRecord>, string>({
      query: (id) => ({ url: `compliance-records/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => tagItem(T.ComplianceRecord, id),
    }),
    createComplianceRecord: builder.mutation<
      ApiSuccess<ComplianceRecord>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "compliance-records",
        method: "POST",
        body,
      }),
      invalidatesTags: invTags(T.ComplianceRecord, T.Analytics),
    }),
    updateComplianceRecord: builder.mutation<
      ApiSuccess<ComplianceRecord>,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `compliance-records/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: invTags(T.ComplianceRecord, T.Analytics),
    }),
    deleteComplianceRecord: builder.mutation<void, string>({
      query: (id) => ({
        url: `compliance-records/${id}`,
        method: "DELETE",
        responseHandler: async (response) =>
          response.status === 204 ? null : response.json(),
      }),
      invalidatesTags: invTags(T.ComplianceRecord, T.Analytics),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetComplianceRecordsQuery,
  useGetComplianceSummaryQuery,
  useGetCompliancePropertyScoreQuery,
  useGetComplianceRecordQuery,
  useCreateComplianceRecordMutation,
  useUpdateComplianceRecordMutation,
  useDeleteComplianceRecordMutation,
} = complianceApi;

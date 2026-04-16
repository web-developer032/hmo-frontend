import {
  T,
  TID,
  invTags,
  tagItem,
  tagItems,
} from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiListSuccess, ApiSuccess } from "@/lib/api/types";
import type { RentPayment, RentSummaryTotals } from "@/lib/types/entities";

export const rentApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    getRentPayments: builder.query<
      ApiListSuccess<RentPayment>,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        dueDateBefore?: string;
        dueDateAfter?: string;
      } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.page != null) params.set("page", String(a.page));
        if (a.limit != null) params.set("limit", String(a.limit));
        if (a.search) params.set("search", a.search);
        if (a.status) params.set("status", a.status);
        if (a.dueDateBefore) params.set("dueDateBefore", a.dueDateBefore);
        if (a.dueDateAfter) params.set("dueDateAfter", a.dueDateAfter);
        const q = params.toString();
        return { url: `rent-payments${q ? `?${q}` : ""}`, method: "GET" };
      },
      providesTags: (res) => tagItems(T.RentPayment, res),
    }),
    getRentSummary: builder.query<ApiSuccess<RentSummaryTotals>, void>({
      query: () => ({ url: "rent-payments/summary", method: "GET" }),
      providesTags: tagItem(T.RentPayment, TID.SUMMARY),
    }),
    getRentPayment: builder.query<ApiSuccess<RentPayment>, string>({
      query: (id) => ({ url: `rent-payments/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => tagItem(T.RentPayment, id),
    }),
    createRentPayment: builder.mutation<
      ApiSuccess<RentPayment>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "rent-payments",
        method: "POST",
        body,
      }),
      invalidatesTags: invTags(T.RentPayment, T.Analytics),
    }),
    generateRentSchedule: builder.mutation<
      ApiSuccess<RentPayment[]>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "rent-payments/schedule",
        method: "POST",
        body,
      }),
      invalidatesTags: invTags(T.RentPayment, T.Analytics),
    }),
    updateRentPayment: builder.mutation<
      ApiSuccess<RentPayment>,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `rent-payments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: invTags(T.RentPayment, T.Analytics),
    }),
    deleteRentPayment: builder.mutation<void, string>({
      query: (id) => ({
        url: `rent-payments/${id}`,
        method: "DELETE",
        responseHandler: async (response) =>
          response.status === 204 ? null : response.json(),
      }),
      invalidatesTags: invTags(T.RentPayment, T.Analytics),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetRentPaymentsQuery,
  useGetRentSummaryQuery,
  useGetRentPaymentQuery,
  useCreateRentPaymentMutation,
  useGenerateRentScheduleMutation,
  useUpdateRentPaymentMutation,
  useDeleteRentPaymentMutation,
} = rentApi;

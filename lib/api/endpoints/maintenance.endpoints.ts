import {
  T,
  TID,
  invTags,
  tagItem,
  tagItems,
} from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiListSuccess, ApiSuccess } from "@/lib/api/types";
import type { MaintenanceTicket } from "@/lib/types/entities";

type MaintListArg = {
  page?: number;
  limit?: number;
  propertyId?: string;
  roomId?: string;
  status?: string;
  search?: string;
  tenantId?: string;
} | void;

export const maintenanceApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    getMaintenanceTickets: builder.query<
      ApiListSuccess<MaintenanceTicket>,
      MaintListArg
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.page != null) params.set("page", String(a.page));
        if (a.limit != null) params.set("limit", String(a.limit));
        if (a.propertyId) params.set("propertyId", a.propertyId);
        if (a.roomId) params.set("roomId", a.roomId);
        if (a.status) params.set("status", a.status);
        if (a.search) params.set("search", a.search);
        if (a.tenantId) params.set("tenantId", a.tenantId);
        const q = params.toString();
        return {
          url: `maintenance-tickets${q ? `?${q}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (res) => tagItems(T.MaintenanceTicket, res),
    }),
    getMaintenanceSummaryStatus: builder.query<
      ApiSuccess<Record<string, number>>,
      void
    >({
      query: () => ({
        url: "maintenance-tickets/summary/status",
        method: "GET",
      }),
      providesTags: tagItem(T.MaintenanceTicket, TID.SUMMARY_STATUS),
    }),
    getMaintenanceTicket: builder.query<ApiSuccess<MaintenanceTicket>, string>(
      {
        query: (id) => ({ url: `maintenance-tickets/${id}`, method: "GET" }),
        providesTags: (_r, _e, id) => tagItem(T.MaintenanceTicket, id),
      },
    ),
    createMaintenanceTicket: builder.mutation<
      ApiSuccess<MaintenanceTicket>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "maintenance-tickets",
        method: "POST",
        body,
      }),
      invalidatesTags: invTags(T.MaintenanceTicket),
    }),
    updateMaintenanceTicket: builder.mutation<
      ApiSuccess<MaintenanceTicket>,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `maintenance-tickets/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: invTags(T.MaintenanceTicket),
    }),
    deleteMaintenanceTicket: builder.mutation<void, string>({
      query: (id) => ({
        url: `maintenance-tickets/${id}`,
        method: "DELETE",
        responseHandler: async (response) =>
          response.status === 204 ? null : response.json(),
      }),
      invalidatesTags: invTags(T.MaintenanceTicket),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetMaintenanceTicketsQuery,
  useGetMaintenanceSummaryStatusQuery,
  useGetMaintenanceTicketQuery,
  useCreateMaintenanceTicketMutation,
  useUpdateMaintenanceTicketMutation,
  useDeleteMaintenanceTicketMutation,
} = maintenanceApi;

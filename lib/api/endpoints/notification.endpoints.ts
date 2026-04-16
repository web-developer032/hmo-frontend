import {
  T,
  TID,
  tagItem,
  tagItems,
  tagList,
  tagMerge,
} from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiListSuccess, ApiSuccess } from "@/lib/api/types";
import type { HmoNotification } from "@/lib/types/entities";

export const notificationApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      ApiListSuccess<HmoNotification>,
      { page?: number; limit?: number; isRead?: boolean } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.page != null) params.set("page", String(a.page));
        if (a.limit != null) params.set("limit", String(a.limit));
        if (a.isRead != null) params.set("isRead", String(a.isRead));
        const q = params.toString();
        return { url: `notifications${q ? `?${q}` : ""}`, method: "GET" };
      },
      providesTags: (res) => tagItems(T.Auth, res),
    }),
    getUnreadNotificationCount: builder.query<
      ApiSuccess<{ count: number }>,
      void
    >({
      query: () => ({ url: "notifications/unread/count", method: "GET" }),
      providesTags: tagItem(T.Auth, TID.UNREAD),
    }),
    markNotificationRead: builder.mutation<ApiSuccess<HmoNotification>, string>(
      {
        query: (id) => ({ url: `notifications/${id}/read`, method: "POST" }),
        invalidatesTags: tagMerge(tagList(T.Auth), tagItem(T.Auth, TID.UNREAD)),
      }
    ),
  }),
  overrideExisting: true,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
} = notificationApi;

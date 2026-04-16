import {
  T,
  invTags,
  tagItem,
  tagItems,
} from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiListSuccess, ApiSuccess } from "@/lib/api/types";
import type { Subscription } from "@/lib/types/entities";

export const subscriptionApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptions: builder.query<
      ApiListSuccess<Subscription>,
      {
        page?: number;
        limit?: number;
        userId?: string;
        tier?: string;
        status?: string;
      } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.page != null) params.set("page", String(a.page));
        if (a.limit != null) params.set("limit", String(a.limit));
        if (a.userId) params.set("userId", a.userId);
        if (a.tier) params.set("tier", a.tier);
        if (a.status) params.set("status", a.status);
        const q = params.toString();
        return { url: `subscriptions${q ? `?${q}` : ""}`, method: "GET" };
      },
      providesTags: (res) => tagItems(T.Subscription, res),
    }),
    getSubscription: builder.query<ApiSuccess<Subscription>, string>({
      query: (id) => ({ url: `subscriptions/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => tagItem(T.Subscription, id),
    }),
    getActiveSubscriptionForUser: builder.query<
      ApiSuccess<Subscription | null>,
      string
    >({
      query: (userId) => ({
        url: `subscriptions/users/${userId}/active`,
        method: "GET",
      }),
      providesTags: (_r, _e, userId) =>
        tagItem(T.Subscription, `ACTIVE-${userId}`),
    }),
    createSubscription: builder.mutation<
      ApiSuccess<Subscription>,
      Record<string, unknown>
    >({
      query: (body) => ({ url: "subscriptions", method: "POST", body }),
      invalidatesTags: invTags(T.Subscription),
    }),
    createStripeCheckoutSession: builder.mutation<
      ApiSuccess<{ url: string }>,
      { tier: string }
    >({
      query: (body) => ({
        url: "subscriptions/billing/checkout-session",
        method: "POST",
        body,
      }),
      invalidatesTags: invTags(T.Subscription),
    }),
    updateSubscription: builder.mutation<
      ApiSuccess<Subscription>,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `subscriptions/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: invTags(T.Subscription),
    }),
    deleteSubscription: builder.mutation<void, string>({
      query: (id) => ({
        url: `subscriptions/${id}`,
        method: "DELETE",
        responseHandler: async (response) =>
          response.status === 204 ? null : response.json(),
      }),
      invalidatesTags: invTags(T.Subscription),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetSubscriptionsQuery,
  useGetSubscriptionQuery,
  useGetActiveSubscriptionForUserQuery,
  useCreateSubscriptionMutation,
  useCreateStripeCheckoutSessionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
} = subscriptionApi;

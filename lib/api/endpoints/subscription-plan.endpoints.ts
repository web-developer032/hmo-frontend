import {
  T,
  invTags,
  tagItemAndList,
  tagItems,
  tagList,
} from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiListSuccess, ApiSuccess } from "@/lib/api/types";
import type { SubscriptionPlan } from "@/lib/types/entities";

export const subscriptionPlanApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<
      ApiListSuccess<SubscriptionPlan>,
      void
    >({
      query: () => ({ url: "subscription-plans", method: "GET" }),
      providesTags: (res) => tagItems(T.SubscriptionPlan, res),
    }),
    getActiveSubscriptionPlans: builder.query<
      ApiListSuccess<SubscriptionPlan>,
      void
    >({
      query: () => ({ url: "subscription-plans/active", method: "GET" }),
      providesTags: tagList(T.SubscriptionPlan),
    }),
    createSubscriptionPlan: builder.mutation<
      ApiSuccess<SubscriptionPlan>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "subscription-plans",
        method: "POST",
        body,
      }),
      invalidatesTags: invTags(T.SubscriptionPlan),
    }),
    updateSubscriptionPlan: builder.mutation<
      ApiSuccess<SubscriptionPlan>,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `subscription-plans/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) =>
        tagItemAndList(T.SubscriptionPlan, id),
    }),
    deleteSubscriptionPlan: builder.mutation<void, string>({
      query: (id) => ({
        url: `subscription-plans/${id}`,
        method: "DELETE",
        responseHandler: async (response) => {
          if (response.status === 204) return null;
          if (!response.ok) return response.json();
          return null;
        },
      }),
      invalidatesTags: invTags(T.SubscriptionPlan),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetSubscriptionPlansQuery,
  useGetActiveSubscriptionPlansQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
} = subscriptionPlanApi;

import {
  T,
  TID,
  tagItem,
  tagItemAndList,
  tagList,
  tagMerge,
} from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiSuccess } from "@/lib/api/types";
import type { LandlordProfile } from "@/lib/types/entities";

export const landlordProfileApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    getLandlordProfileByUserId: builder.query<
      ApiSuccess<LandlordProfile | null>,
      string
    >({
      query: (userId) => ({
        url: `landlord-profiles/users/${userId}`,
        method: "GET",
      }),
      providesTags: (_r, _e, userId) =>
        tagMerge(
          tagItem(T.Auth, `landlord-user-${userId}`),
          tagItem(T.Auth, TID.ME)
        ),
    }),
    createLandlordProfile: builder.mutation<
      ApiSuccess<LandlordProfile>,
      Record<string, unknown>
    >({
      query: (body) => ({ url: "landlord-profiles", method: "POST", body }),
      invalidatesTags: tagMerge(tagList(T.Auth), tagItem(T.Auth, TID.ME)),
    }),
    updateLandlordProfile: builder.mutation<
      ApiSuccess<LandlordProfile>,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `landlord-profiles/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => tagItemAndList(T.Auth, id),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetLandlordProfileByUserIdQuery,
  useCreateLandlordProfileMutation,
  useUpdateLandlordProfileMutation,
} = landlordProfileApi;

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
import type { Listing, ListingApplication } from "@/lib/types/entities";

type SearchArg = {
  page?: number;
  limit?: number;
  city?: string;
  postcode?: string;
  propertyType?: string;
  minRent?: number;
  maxRent?: number;
};

export const listingApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    searchListings: builder.query<ApiListSuccess<Listing>, SearchArg | void>({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.page != null) params.set("page", String(a.page));
        if (a.limit != null) params.set("limit", String(a.limit));
        if (a.city) params.set("city", a.city);
        if (a.postcode) params.set("postcode", a.postcode);
        if (a.propertyType) params.set("propertyType", a.propertyType);
        if (a.minRent != null) params.set("minRent", String(a.minRent));
        if (a.maxRent != null) params.set("maxRent", String(a.maxRent));
        const q = params.toString();
        return { url: `listings/search${q ? `?${q}` : ""}`, method: "GET" };
      },
      providesTags: (res) => tagItems(T.Listing, res),
    }),
    getListing: builder.query<ApiSuccess<Listing>, string>({
      query: (id) => ({ url: `listings/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => tagItem(T.Listing, id),
    }),
    getMyListings: builder.query<
      ApiListSuccess<Listing>,
      { page?: number; limit?: number } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.page != null) params.set("page", String(a.page));
        if (a.limit != null) params.set("limit", String(a.limit));
        const q = params.toString();
        return { url: `listings/mine${q ? `?${q}` : ""}`, method: "GET" };
      },
      providesTags: (res) => tagItems(T.Listing, res),
    }),
    getListingsByProperty: builder.query<
      ApiListSuccess<Listing>,
      string
    >({
      query: (propertyId) => ({
        url: `listings/by-property/${propertyId}`,
        method: "GET",
      }),
      providesTags: (_r, _e, propertyId) => [
        { type: T.Listing, id: TID.LIST },
        { type: T.Listing, id: `by-property:${propertyId}` },
      ],
    }),
    createOrGetListingForRoom: builder.mutation<
      ApiSuccess<Listing>,
      string
    >({
      query: (roomId) => ({
        url: `listings/for-room/${roomId}`,
        method: "POST",
      }),
      invalidatesTags: tagMerge(
        tagList(T.Listing),
        tagList(T.Property),
      ),
    }),
    createListing: builder.mutation<
      ApiSuccess<Listing>,
      Record<string, unknown>
    >({
      query: (body) => ({ url: "listings", method: "POST", body }),
      invalidatesTags: tagMerge(tagList(T.Listing), tagList(T.Property)),
    }),
    updateListing: builder.mutation<
      ApiSuccess<Listing>,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `listings/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) =>
        tagMerge(
          tagItem(T.Listing, id),
          tagList(T.Listing),
          tagList(T.Property),
        ),
    }),
    deleteListing: builder.mutation<void, string>({
      query: (id) => ({
        url: `listings/${id}`,
        method: "DELETE",
        responseHandler: async (response) =>
          response.status === 204 ? null : response.json(),
      }),
      invalidatesTags: (_r, _e, id) =>
        tagMerge(tagItem(T.Listing, id), tagList(T.Listing)),
    }),
    applyToListing: builder.mutation<
      ApiSuccess<ListingApplication>,
      { listingId: string; body?: { message?: string } }
    >({
      query: ({ listingId, body }) => ({
        url: `listings/${listingId}/applications`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: tagMerge(
        tagList(T.ListingApplication),
        tagList(T.Listing)
      ),
    }),
    getMyApplications: builder.query<
      ApiListSuccess<ListingApplication>,
      { page?: number; limit?: number } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.page != null) params.set("page", String(a.page));
        if (a.limit != null) params.set("limit", String(a.limit));
        const q = params.toString();
        return {
          url: `listings/applications/me${q ? `?${q}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (res) =>
        tagMerge(
          tagItems(T.ListingApplication, res),
          tagList(T.ListingApplication)
        ),
    }),
    getLandlordApplicationInbox: builder.query<
      ApiListSuccess<ListingApplication>,
      { page?: number; limit?: number } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.page != null) params.set("page", String(a.page));
        if (a.limit != null) params.set("limit", String(a.limit));
        const q = params.toString();
        return {
          url: `listings/applications/inbox${q ? `?${q}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (res) => tagItems(T.ListingApplication, res),
    }),
    acceptListingApplication: builder.mutation<
      ApiSuccess<{ application: ListingApplication; tenancyId: string }>,
      string
    >({
      query: (applicationId) => ({
        url: `listings/applications/${applicationId}/accept`,
        method: "POST",
      }),
      invalidatesTags: tagMerge(
        tagList(T.ListingApplication),
        tagList(T.Tenancy),
        tagList(T.Property),
        tagList(T.Room)
      ),
    }),
    declineListingApplication: builder.mutation<
      ApiSuccess<ListingApplication>,
      string
    >({
      query: (applicationId) => ({
        url: `listings/applications/${applicationId}/decline`,
        method: "POST",
      }),
      invalidatesTags: tagList(T.ListingApplication),
    }),
    startTenancyFromApplication: builder.mutation<
      ApiSuccess<{ application: ListingApplication; tenancyId: string }>,
      string
    >({
      query: (applicationId) => ({
        url: `listings/applications/${applicationId}/start-tenancy`,
        method: "POST",
      }),
      invalidatesTags: tagMerge(
        tagList(T.ListingApplication),
        tagList(T.Tenancy),
        tagList(T.Property),
        tagList(T.Room),
        tagList(T.HmoDocument)
      ),
    }),
  }),
  overrideExisting: true,
});

export const {
  useSearchListingsQuery,
  useGetListingQuery,
  useGetMyListingsQuery,
  useGetListingsByPropertyQuery,
  useCreateOrGetListingForRoomMutation,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useApplyToListingMutation,
  useGetMyApplicationsQuery,
  useGetLandlordApplicationInboxQuery,
  useAcceptListingApplicationMutation,
  useDeclineListingApplicationMutation,
  useStartTenancyFromApplicationMutation,
} = listingApi;

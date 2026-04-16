import {
  T,
  TID,
  invTags,
  tagItem,
  tagItemAndList,
  tagItems,
  tagList,
  tagMerge,
} from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiListSuccess, ApiSuccess } from "@/lib/api/types";
import type { TenantProfile, Tenancy } from "@/lib/types/entities";

export const tenantModuleApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    getTenantProfiles: builder.query<
      ApiListSuccess<TenantProfile>,
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.page != null) params.set("page", String(a.page));
        if (a.limit != null) params.set("limit", String(a.limit));
        if (a.search) params.set("search", a.search);
        const q = params.toString();
        return { url: `tenants/profiles${q ? `?${q}` : ""}`, method: "GET" };
      },
      providesTags: (res) => tagItems(T.TenantProfile, res),
    }),
    getTenantProfileMe: builder.query<
      ApiSuccess<TenantProfile | null>,
      void
    >({
      query: () => ({ url: "tenants/profiles/me", method: "GET" }),
      providesTags: tagItem(T.TenantProfile, TID.ME),
    }),
    createTenantProfileMe: builder.mutation<
      ApiSuccess<TenantProfile>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "tenants/profiles/me",
        method: "POST",
        body,
      }),
      invalidatesTags: tagMerge(
        tagList(T.TenantProfile),
        tagItem(T.TenantProfile, TID.ME),
      ),
    }),
    getTenantProfile: builder.query<ApiSuccess<TenantProfile>, string>({
      query: (id) => ({ url: `tenants/profiles/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => tagItem(T.TenantProfile, id),
    }),
    getTenantProfileForLandlord: builder.query<
      ApiSuccess<TenantProfile>,
      string
    >({
      query: (id) => ({
        url: `tenants/profiles/${id}/for-landlord`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => tagItem(T.TenantProfile, id),
    }),
    createTenantProfile: builder.mutation<
      ApiSuccess<TenantProfile>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "tenants/profiles",
        method: "POST",
        body,
      }),
      invalidatesTags: tagList(T.TenantProfile),
    }),
    updateTenantProfile: builder.mutation<
      ApiSuccess<TenantProfile>,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `tenants/profiles/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) =>
        tagMerge(
          tagItem(T.TenantProfile, id),
          tagList(T.TenantProfile),
          tagItem(T.TenantProfile, TID.ME),
        ),
    }),
    deleteTenantProfile: builder.mutation<void, string>({
      query: (id) => ({
        url: `tenants/profiles/${id}`,
        method: "DELETE",
        responseHandler: async (response) =>
          response.status === 204 ? null : response.json(),
      }),
      invalidatesTags: (_r, _e, id) =>
        tagMerge(tagItem(T.TenantProfile, id), tagList(T.TenantProfile)),
    }),
    getTenancies: builder.query<
      ApiListSuccess<Tenancy>,
      { page?: number; limit?: number; search?: string; status?: string } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.page != null) params.set("page", String(a.page));
        if (a.limit != null) params.set("limit", String(a.limit));
        if (a.search) params.set("search", a.search);
        if (a.status) params.set("status", a.status);
        const q = params.toString();
        return { url: `tenancies${q ? `?${q}` : ""}`, method: "GET" };
      },
      providesTags: (res) => tagItems(T.Tenancy, res),
    }),
    getTenancy: builder.query<ApiSuccess<Tenancy>, string>({
      query: (id) => ({ url: `tenancies/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => tagItem(T.Tenancy, id),
    }),
    createTenancy: builder.mutation<
      ApiSuccess<Tenancy>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "tenancies",
        method: "POST",
        body,
      }),
      invalidatesTags: invTags(
        T.Tenancy,
        T.TenantProfile,
        T.Property,
        T.Room,
      ),
    }),
    updateTenancy: builder.mutation<
      ApiSuccess<Tenancy>,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `tenancies/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => tagItemAndList(T.Tenancy, id),
    }),
    deleteTenancy: builder.mutation<void, string>({
      query: (id) => ({
        url: `tenancies/${id}`,
        method: "DELETE",
        responseHandler: async (response) =>
          response.status === 204 ? null : response.json(),
      }),
      invalidatesTags: (_r, _e, id) => tagItemAndList(T.Tenancy, id),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetTenantProfilesQuery,
  useGetTenantProfileMeQuery,
  useCreateTenantProfileMeMutation,
  useGetTenantProfileQuery,
  useGetTenantProfileForLandlordQuery,
  useCreateTenantProfileMutation,
  useUpdateTenantProfileMutation,
  useDeleteTenantProfileMutation,
  useGetTenanciesQuery,
  useGetTenancyQuery,
  useCreateTenancyMutation,
  useUpdateTenancyMutation,
  useDeleteTenancyMutation,
} = tenantModuleApi;

import {
  T,
  invTags,
  tagItem,
  tagItems,
} from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiListSuccess, ApiSuccess } from "@/lib/api/types";
import type { AdminUserRow } from "@/lib/types/entities";

export const adminUserApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<
      ApiListSuccess<AdminUserRow>,
      { page?: number; limit?: number; search?: string; role?: string } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.page != null) params.set("page", String(a.page));
        if (a.limit != null) params.set("limit", String(a.limit));
        if (a.search) params.set("search", a.search);
        if (a.role) params.set("role", a.role);
        const q = params.toString();
        return { url: `users${q ? `?${q}` : ""}`, method: "GET" };
      },
      providesTags: (res) => tagItems(T.AdminUser, res),
    }),
    getUser: builder.query<ApiSuccess<AdminUserRow>, string>({
      query: (id) => ({ url: `users/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => tagItem(T.AdminUser, id),
    }),
    createUser: builder.mutation<
      ApiSuccess<AdminUserRow>,
      Record<string, unknown>
    >({
      query: (body) => ({ url: "users", method: "POST", body }),
      invalidatesTags: invTags(T.AdminUser),
    }),
    updateUser: builder.mutation<
      ApiSuccess<AdminUserRow>,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: invTags(T.AdminUser, T.Auth),
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
        responseHandler: async (response) =>
          response.status === 204 ? null : response.json(),
      }),
      invalidatesTags: invTags(T.AdminUser),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = adminUserApi;

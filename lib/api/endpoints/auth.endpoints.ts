import { setCredentials } from "@/features/auth/auth-slice";
import { setAuthenticatedCookie } from "@/lib/auth/session-cookie";
import { persistRefreshOnly } from "@/lib/auth/persist";
import { T, tagEntire } from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiSuccess, AuthPayload, AuthUser } from "@/lib/api/types";

export const authApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      ApiSuccess<AuthPayload>,
      { email: string; password: string }
    >({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            persistRefreshOnly(data.data.refreshToken, data.data.expiresIn);
            setAuthenticatedCookie();
            dispatch(setCredentials(data.data));
          }
        } catch {
          /* surfaced via unwrap() in UI */
        }
      },
    }),
    register: builder.mutation<
      ApiSuccess<AuthPayload>,
      { name: string; email: string; password: string; roles: string[] }
    >({
      query: (body) => ({
        url: "auth/register",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            persistRefreshOnly(data.data.refreshToken, data.data.expiresIn);
            setAuthenticatedCookie();
            dispatch(setCredentials(data.data));
          }
        } catch {
          /* surfaced via unwrap() in UI */
        }
      },
    }),
    logout: builder.mutation<
      ApiSuccess<{ success: boolean }>,
      { refreshToken: string }
    >({
      query: (body) => ({
        url: "auth/logout",
        method: "POST",
        body,
      }),
    }),
    logoutAll: builder.mutation<ApiSuccess<{ success: boolean }>, void>({
      query: () => ({
        url: "auth/logout-all",
        method: "POST",
      }),
    }),
    getMe: builder.query<ApiSuccess<AuthUser>, void>({
      query: () => ({ url: "users/me", method: "GET" }),
      providesTags: tagEntire(T.Auth),
    }),
    forgotPassword: builder.mutation<ApiSuccess<{ ok: boolean }>, { email: string }>(
      {
        query: (body) => ({
          url: "auth/forgot-password",
          method: "POST",
          body,
        }),
      },
    ),
    resetPassword: builder.mutation<
      ApiSuccess<AuthPayload>,
      { token: string; newPassword: string }
    >({
      query: (body) => ({
        url: "auth/reset-password",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            persistRefreshOnly(data.data.refreshToken, data.data.expiresIn);
            setAuthenticatedCookie();
            dispatch(setCredentials(data.data));
          }
        } catch {
          /* surfaced via unwrap() in UI */
        }
      },
    }),
    updatePassword: builder.mutation<
      ApiSuccess<AuthPayload>,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: "auth/update-password",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            persistRefreshOnly(data.data.refreshToken, data.data.expiresIn);
            setAuthenticatedCookie();
            dispatch(setCredentials(data.data));
          }
        } catch {
          /* surfaced via unwrap() in UI */
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useLazyGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
} = authApi;

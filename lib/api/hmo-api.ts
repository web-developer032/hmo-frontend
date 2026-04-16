import {
  createApi,
  fetchBaseQuery,
  retry,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { clearAuth, setCredentials } from "@/features/auth/auth-slice";
import {
  clearAuthenticatedCookie,
  setAuthenticatedCookie,
} from "@/lib/auth/session-cookie";
import {
  clearPersistedAuth,
  persistRefreshOnly,
  readRefreshToken,
} from "@/lib/auth/persist";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { HMO_TAG_TYPES } from "@/lib/api/cache-tags";
import type { ApiSuccess, AuthUser, TokenPair } from "@/lib/api/types";

const baseUrl = getApiBaseUrl();

type AuthSliceState = {
  auth: {
    accessToken: string | null;
    user: AuthUser | null;
  };
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const { accessToken } = (getState() as AuthSliceState).auth;
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    headers.set("Accept", "application/json");
    return headers;
  },
});

const mutex = new Mutex();

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) {
    return result;
  }

  const path = typeof args === "string" ? args : args.url;
  if (
    path === "auth/refresh" ||
    path === "auth/login" ||
    path === "auth/register" ||
    path === "auth/logout" ||
    path === "auth/logout-all"
  ) {
    return result;
  }

  const release = await mutex.acquire();
  try {
    const refreshToken = readRefreshToken();
    if (!refreshToken) {
      api.dispatch(clearAuth());
      clearPersistedAuth();
      clearAuthenticatedCookie();
      return result;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: "auth/refresh",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions,
    );

    if (!refreshResult.data) {
      api.dispatch(clearAuth());
      clearPersistedAuth();
      clearAuthenticatedCookie();
      return result;
    }

    const tokens = (refreshResult.data as ApiSuccess<TokenPair>).data;
    persistRefreshOnly(tokens.refreshToken, tokens.expiresIn);
    setAuthenticatedCookie();

    const { user: existingUser } = (api.getState() as AuthSliceState).auth;
    let user = existingUser;

    if (!user) {
      const meResult = await rawBaseQuery(
        {
          url: "users/me",
          method: "GET",
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        },
        api,
        extraOptions,
      );
      if (meResult.data) {
        user = (meResult.data as ApiSuccess<AuthUser>).data;
      }
    }

    if (!user) {
      api.dispatch(clearAuth());
      clearPersistedAuth();
      clearAuthenticatedCookie();
      return result;
    }

    api.dispatch(
      setCredentials({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      }),
    );

    result = await rawBaseQuery(args, api, extraOptions);
  } finally {
    release();
  }

  return result;
};

const baseQueryWithRetry = retry(baseQueryWithReauth, {
  maxRetries: 2,
});

export const hmoApi = createApi({
  reducerPath: "hmoApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: [...HMO_TAG_TYPES],
  keepUnusedDataFor: 60,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});

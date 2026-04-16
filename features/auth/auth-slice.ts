import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthPayload, AuthUser } from "@/lib/api/types";

export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** False until bootstrap finishes (refresh + /users/me or “no session”). */
  hydrated: boolean;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthPayload>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setAuthHydrated: (state, action: PayloadAction<boolean>) => {
      state.hydrated = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
});

export const { setCredentials, setAuthHydrated, clearAuth } =
  authSlice.actions;
export const authReducer = authSlice.reducer;

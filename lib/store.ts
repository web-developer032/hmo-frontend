import "@/lib/api/register-endpoints";
import { configureStore } from "@reduxjs/toolkit";
import { authReducer, clearAuth } from "@/features/auth/auth-slice";
import { hmoApi } from "@/lib/api/hmo-api";
import { uiReducer } from "@/features/ui/ui-slice";
import { REFRESH_TOKEN_KEY } from "@/lib/constants/storage";

export const store = configureStore({
  reducer: {
    [hmoApi.reducerPath]: hmoApi.reducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(hmoApi.middleware),
});

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== REFRESH_TOKEN_KEY) return;
    if (event.newValue) return;
    store.dispatch(clearAuth());
    store.dispatch(hmoApi.util.resetApiState());
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

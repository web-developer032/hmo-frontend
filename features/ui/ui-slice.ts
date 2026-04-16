import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  Role,
  type RoleValue,
} from "@/lib/constants/roles";

export type ActiveNavRole = RoleValue | "all";

export type UiState = {
  activeNavRole: ActiveNavRole;
};

const initialState: UiState = {
  activeNavRole: "all",
};

function defaultNavRoleForRoles(roles: string[]): ActiveNavRole {
  if (roles.length === 1) return roles[0] as ActiveNavRole;
  return "all";
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActiveNavRole: (state, action: PayloadAction<ActiveNavRole>) => {
      state.activeNavRole = action.payload;
    },
    hydrateActiveNavRole: (state, action: PayloadAction<string | null>) => {
      const v = action.payload;
      if (v === "all" || v === Role.Landlord || v === Role.Tenant || v === Role.Admin) {
        state.activeNavRole = v;
      }
    },
    validateActiveNavForUser: (state, action: PayloadAction<string[]>) => {
      const roles = action.payload;
      const { activeNavRole } = state;
      if (activeNavRole === "all") return;
      if (!roles.includes(activeNavRole)) {
        state.activeNavRole = defaultNavRoleForRoles(roles);
      }
    },
    clearUiPreferences: (state) => {
      state.activeNavRole = "all";
    },
  },
});

export const {
  setActiveNavRole,
  hydrateActiveNavRole,
  validateActiveNavForUser,
  clearUiPreferences,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;

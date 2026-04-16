"use client";

import { useEffect } from "react";
import { ACTIVE_NAV_ROLE_KEY } from "@/lib/constants/storage";
import { Role, hasAnyRole } from "@/lib/constants/roles";
import {
  hydrateActiveNavRole,
  setActiveNavRole,
  validateActiveNavForUser,
  type ActiveNavRole,
} from "@/features/ui/ui-slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { cn } from "@/lib/utils/cn";

function roleOptionsForUser(roles: string[]) {
  const opts: { value: ActiveNavRole; label: string }[] = [
    { value: "all", label: "All" },
  ];
  if (hasAnyRole(roles, [Role.Landlord])) {
    opts.push({ value: Role.Landlord, label: "Landlord" });
  }
  if (hasAnyRole(roles, [Role.Tenant])) {
    opts.push({ value: Role.Tenant, label: "Tenant" });
  }
  if (hasAnyRole(roles, [Role.Admin])) {
    opts.push({ value: Role.Admin, label: "Admin" });
  }
  return opts;
}

function distinctRoleCount(roles: string[]): number {
  return new Set(roles).size;
}

export function RoleSwitcher({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const activeNavRole = useAppSelector((s) => s.ui.activeNavRole);

  useEffect(() => {
    if (typeof window === "undefined") return;
    dispatch(hydrateActiveNavRole(localStorage.getItem(ACTIVE_NAV_ROLE_KEY)));
  }, [dispatch]);

  useEffect(() => {
    if (!user?.roles?.length) return;
    dispatch(validateActiveNavForUser(user.roles));
  }, [user, dispatch]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACTIVE_NAV_ROLE_KEY, activeNavRole);
  }, [activeNavRole]);

  if (!user?.roles?.length || distinctRoleCount(user.roles) < 2) {
    return null;
  }

  const options = roleOptionsForUser(user.roles);
  const value: ActiveNavRole = options.some((o) => o.value === activeNavRole)
    ? activeNavRole
    : "all";

  return (
    <div
      className={cn(
        "mb-4 rounded-[var(--radius-md)] border border-[var(--border-design)] bg-[var(--paper-2)] p-2 shadow-[var(--shadow-sm)]",
        className
      )}
    >
      <div className="mb-2 px-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--ink-4)]">
          Workspace
        </p>
        <p className="mt-0.5 text-[0.68rem] leading-snug text-[var(--ink-3)]">
          Filter navigation and dashboards by role. Your account is unchanged.
        </p>
      </div>
      <div
        className="flex gap-1 rounded-md bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] p-1"
        role="tablist"
        aria-label="Workspace role filter"
      >
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn(
                "min-h-9 flex-1 cursor-pointer rounded-md px-2 py-1.5 text-center text-[0.72rem] font-semibold transition-all",
                active
                  ? "bg-card text-[var(--ink)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--border-design)]"
                  : "text-[var(--ink-3)] hover:bg-card/60 hover:text-[var(--ink)]"
              )}
              onClick={() => dispatch(setActiveNavRole(o.value))}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

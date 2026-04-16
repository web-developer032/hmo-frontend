"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { clearAuth } from "@/features/auth/auth-slice";
import { clearUiPreferences } from "@/features/ui/ui-slice";
import { hmoApi, useLogoutAllMutation, useLogoutMutation } from "@/lib/api";
import { ACTIVE_NAV_ROLE_KEY } from "@/lib/constants/storage";
import { clearPersistedAuth } from "@/lib/auth/persist";
import { clearAuthenticatedCookie } from "@/lib/auth/session-cookie";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { cn } from "@/lib/utils/cn";

function isNavHrefActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(`${href}/`)) return true;
  return false;
}

/** Full-width main: marketing home, auth, or loading without shell chrome rules. */
function useFullWidthMain(pathname: string, hasUser: boolean) {
  if (!hasUser) return true;
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return true;
  }
  return false;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const refreshToken = useAppSelector((s) => s.auth.refreshToken);
  const [logoutApi, { isLoading: loggingOut }] = useLogoutMutation();
  const [logoutAllApi, { isLoading: loggingOutAll }] = useLogoutAllMutation();
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const [signOutAllConfirmOpen, setSignOutAllConfirmOpen] = useState(false);

  const fullWidthMain = useFullWidthMain(pathname, !!user);
  const showSidebar = user && !fullWidthMain;

  function clearSessionAfterAuth() {
    dispatch(hmoApi.util.resetApiState());
    dispatch(clearAuth());
    dispatch(clearUiPreferences());
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(ACTIVE_NAV_ROLE_KEY);
      } catch {
        /* ignore */
      }
    }
    clearPersistedAuth();
    clearAuthenticatedCookie();
    router.push("/login");
    router.refresh();
  }

  async function onLogout() {
    if (refreshToken) {
      try {
        await logoutApi({ refreshToken }).unwrap();
      } catch {
        /* revoke best-effort */
      }
    }
    clearSessionAfterAuth();
    toast.message("Signed out");
  }

  async function onLogoutEverywhere() {
    try {
      await logoutAllApi().unwrap();
    } catch {
      /* revoke all best-effort */
    }
    clearSessionAfterAuth();
    toast.message("Signed out on all devices");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ConfirmDialog
        open={signOutConfirmOpen}
        onOpenChange={setSignOutConfirmOpen}
        title="Sign out?"
        description="You will need to sign in again to access your account."
        confirmLabel="Sign out"
        onConfirm={() => void onLogout()}
      />
      <ConfirmDialog
        open={signOutAllConfirmOpen}
        onOpenChange={setSignOutAllConfirmOpen}
        title="Sign out on all devices?"
        description="This revokes every active session for your account. You will need to sign in again on each device."
        confirmLabel="Sign out everywhere"
        variant="destructive"
        onConfirm={() => void onLogoutEverywhere()}
      />
      <header className="sticky top-0 z-50 flex h-(--topnav-height) shrink-0 items-center gap-0 border-b border-white/10 px-4 sm:px-8 bg-(--ink)">
        <Link
          href="/"
          className="mr-6 shrink-0 font-serif text-[1.1rem] tracking-tight text-white"
        >
          HMO <span className="text-(--accent-mid)">Platform</span>
        </Link>
        {user ? (
          <nav
            className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto scrollbar-none"
            aria-label="Quick links"
          >
            {(
              [
                { href: "/dashboard", label: "Dashboard" },
                { href: "/messages", label: "Messages" },
                { href: "/notifications", label: "Notifications" },
              ] as const
            ).map(({ href, label }) => {
              const active = isNavHrefActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "shrink-0 cursor-pointer rounded-md px-3.5 py-1.5 text-[0.8rem] font-medium uppercase tracking-wide transition-colors",
                    active
                      ? "bg-(--accent) text-white"
                      : "text-white/55 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <div className="flex-1" />
        )}
        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <ThemeToggle variant="topnav" />
          {user ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                disabled={loggingOut || loggingOutAll}
                onClick={() => setSignOutConfirmOpen(true)}
              >
                {loggingOut ? "Signing out…" : "Sign out"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:bg-white/10 hover:text-white"
                title="Revoke every refresh token for this account"
                disabled={loggingOut || loggingOutAll}
                onClick={() => setSignOutAllConfirmOpen(true)}
              >
                {loggingOutAll ? "…" : "Logout all devices"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="/login"
                  className="text-white/80 hover:bg-white/10 hover:text-white"
                >
                  Sign in
                </Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {showSidebar ? (
        <div className="flex min-h-[calc(100vh-var(--topnav-height))] flex-1 flex-col md:flex-row">
          <AppSidebar />
          <main className="min-w-0 flex-1 bg-background px-5 py-8 sm:px-9">
            {children}
          </main>
        </div>
      ) : (
        <main className="flex-1 bg-background">{children}</main>
      )}
    </div>
  );
}

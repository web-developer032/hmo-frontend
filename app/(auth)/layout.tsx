import { Suspense } from "react";
import { GuestRouteGuard } from "@/components/guest-route-guard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-var(--topnav-height))] items-center justify-center bg-background text-sm text-muted">
          Loading...
        </div>
      }
    >
      <GuestRouteGuard>
        <div className="flex min-h-[calc(100vh-var(--topnav-height))] bg-background px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-lg border border-(--border-design) bg-card shadow-(--shadow-design) lg:grid-cols-[1fr_1.05fr] ">
            <aside className="relative hidden flex-col justify-between px-8 py-10 text-white lg:flex bg-(--ink)">
              <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-(--ink) to-transparent" />
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                  HMO Platform
                </p>
                <h1 className="mt-6 max-w-sm font-serif text-3xl font-normal leading-tight tracking-tight xl:text-4xl">
                  Sign in to manage properties, tenants, and rent in one place.
                </h1>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
                  JWT access with refresh rotation. Your data stays scoped by
                  role — landlord, tenant, or admin.
                </p>
              </div>
              <p className="relative z-10 text-xs text-white/40">
                UK HMO operational support — not legal advice.
              </p>
            </aside>
            <main className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
              <div className="w-full max-w-md">{children}</div>
            </main>
          </div>
        </div>
      </GuestRouteGuard>
    </Suspense>
  );
}

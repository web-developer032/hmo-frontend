"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/hooks";
import { cn } from "@/lib/utils/cn";

const roleCards = [
  {
    badge: "Landlord",
    badgeClass: "bg-[var(--accent-light)] text-[var(--accent)]",
    title: "Property operations",
    description:
      "Run HMO rooms or non-HMO properties, review applications, track compliance, and manage rent expectations.",
    pills: [
      "Properties",
      "Rooms",
      "Listings",
      "Applications",
      "Rent",
      "Compliance",
    ],
    href: "/register",
  },
  {
    badge: "Tenant",
    badgeClass: "bg-[var(--blue-light)] text-[var(--blue)]",
    title: "Search and apply",
    description:
      "Browse rooms and properties, apply with your profile, manage documents, rent, and maintenance in one place.",
    pills: ["Search", "Applications", "Rent", "Maintenance"],
    href: "/register",
  },
  {
    badge: "Admin",
    badgeClass: "bg-[var(--paper-3)] text-[var(--ink-2)]",
    title: "Oversight and audit",
    description:
      "See users, subscriptions, notifications, and landlord-tenant activity with admin visibility built into the product.",
    pills: ["Users", "Subscriptions", "Oversight"],
    href: "/register",
  },
] as const;

const RoleCard = memo(function RoleCard({
  badge,
  badgeClass,
  title,
  description,
  pills,
  href,
}: {
  badge: string;
  badgeClass: string;
  title: string;
  description: string;
  pills: readonly string[];
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col rounded-lg border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-design"
      )}
    >
      <span
        className={cn(
          "mb-4 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-wider",
          badgeClass
        )}
      >
        {badge}
      </span>
      <h2 className="font-serif text-2xl tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {pills.map((p) => (
          <span
            key={p}
            className="rounded-full border border-[var(--border-design)] bg-[var(--paper-2)] px-2 py-0.5 text-[0.72rem] text-[var(--ink-3)]"
          >
            {p}
          </span>
        ))}
      </div>
    </Link>
  );
});

export function HomeContent() {
  const user = useAppSelector((s) => s.auth.user);
  const cta = useMemo(
    () =>
      user ? (
        <Button asChild variant="primary" size="md">
          <Link href="/dashboard">Open dashboard</Link>
        </Button>
      ) : (
        <>
          <Button asChild variant="primary" size="md">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="secondary" size="md">
            <Link href="/register">Create account</Link>
          </Button>
        </>
      ),
    [user]
  );

  return (
    <div>
      <section
        className="relative overflow-hidden px-6 py-14 sm:px-10 sm:py-16 lg:px-12"
        style={{
          background: "var(--ink)",
          color: "#fff",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255,255,255,0.015) 40px, rgba(255,255,255,0.015) 41px)`,
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <h1 className="font-serif text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.2rem]">
            Compliance-first
            <br />
            <em className="text-[var(--accent-mid)] not-italic">
              HMO operations
            </em>
          </h1>
          <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-white/60">
            Listings, tenancies, rent, compliance, and messaging — built for UK
            landlords, tenants, and admins in one calm workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">{cta}</div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-6 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:px-10">
        {roleCards.map((card) => (
          <RoleCard key={card.badge} {...card} />
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-6 sm:grid-cols-2 lg:px-10">
        <div className="flex gap-3.5 rounded-md border border-border bg-card p-5 shadow-sm">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--accent)]"
            aria-hidden
          >
            ✓
          </div>
          <div>
            <h3 className="text-sm font-semibold">HMO-aware setup</h3>
            <p className="mt-1 text-[0.8rem] leading-snug text-muted">
              HMO uses room-level rent and availability; non-HMO stays
              property-level, matching the product rules in the docs.
            </p>
          </div>
        </div>
        <div className="flex gap-3.5 rounded-md border border-border bg-card p-5 shadow-sm">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-light text-amber"
            aria-hidden
          >
            !
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              Tenancy and compliance locks
            </h3>
            <p className="mt-1 text-[0.8rem] leading-snug text-muted">
              Commercial room terms stay frozen while tenancies are active, and
              expiry-led documents stay visible so landlords can act early.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-14 sm:grid-cols-3 lg:px-10">
        <div className="rounded-md border border-border bg-card p-5 shadow-sm">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Discovery
          </p>
          <h3 className="mt-2 font-serif text-2xl tracking-tight">
            Tenant search
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Listings, detail pages, and applications are first-class product
            flows, not an afterthought beside property management.
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-5 shadow-sm">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Money
          </p>
          <h3 className="mt-2 font-serif text-2xl tracking-tight">
            Open Banking rent
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The product is built around expected-vs-received rent and bank
            transfer matching, while Stripe stays focused on SaaS billing.
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-5 shadow-sm">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Oversight
          </p>
          <h3 className="mt-2 font-serif text-2xl tracking-tight">
            Admin in the loop
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Messaging, tickets, and platform workflows are designed with admin
            oversight instead of isolated landlord-tenant threads.
          </p>
        </div>
      </section>
    </div>
  );
}

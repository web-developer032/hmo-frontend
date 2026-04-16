"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import {
  getNavSectionsForUser,
  shouldShowLandlordDashboardFeatures,
  type ActiveNavFilter,
} from "@/lib/navigation/role-nav";

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-design)] bg-card p-4 shadow-[var(--shadow-sm)]">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-2 font-serif text-2xl font-normal tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

export function DashboardHub({
  roles,
  userName,
  activeNavRole = "all",
}: {
  roles: string[];
  userName: string;
  activeNavRole?: ActiveNavFilter;
}) {
  const sections = getNavSectionsForUser(roles, activeNavRole);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${userName}`}
        description={`Roles: ${roles.join(", ") || "none"}. The current mode (${activeNavRole}) controls navigation and which product workflows are front and center.`}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Role sections"
          value={sections.length}
          hint="Distinct product areas available in this mode."
        />
        <StatTile
          label="Active mode"
          value={activeNavRole}
          hint="Landlord, Tenant, Admin, or a blended all-roles view."
        />
        <StatTile
          label="Product focus"
          value={
            shouldShowLandlordDashboardFeatures(roles, activeNavRole)
              ? "Operations"
              : "Activity"
          }
          hint="The docs prioritize workflow clarity over generic dashboard polish."
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>How this product is meant to work</CardTitle>
            <CardDescription>
              The UI now reflects the product docs more closely: search and
              applications feed tenancies, tenancies anchor rent, and compliance
              plus messaging stay visible throughout.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              "Search or publish listings",
              "Review and progress applications",
              "Create or manage tenancies",
              "Track rent, compliance, and messages",
            ].map((step) => (
              <div
                key={step}
                className="rounded-[var(--radius-md)] border border-[var(--border-design)] bg-[var(--paper-2)] p-4 text-sm text-[var(--ink-2)]"
              >
                {step}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Priority cues</CardTitle>
            <CardDescription>
              Areas the docs call out as core product value.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <p>Compliance-first property management</p>
            <p>Tenant search and application flow</p>
            <p>Open Banking rent matching</p>
            <p>Admin-visible messaging and tickets</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>
                {section.title === "Landlord" &&
                  "Properties, tenants, rent, compliance, and day-to-day operations."}
                {section.title === "Tenant" &&
                  "Discovery, profile, maintenance requests, documents, and rent."}
                {section.title === "Admin" &&
                  "Users, subscriptions, and platform visibility."}
                {section.title === "Shared" &&
                  "Messages and shared collaboration surfaces."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {section.items.map((item) => (
                <Button key={item.href} variant="secondary" size="md" asChild>
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {shouldShowLandlordDashboardFeatures(roles, activeNavRole) && (
        <Card>
          <CardHeader>
            <CardTitle>Landlord quick links</CardTitle>
            <CardDescription>
              Shortcuts to the flows the product docs center most strongly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" size="md" asChild>
              <Link href="/landlord/properties">Add or edit properties</Link>
            </Button>
            <Button variant="outline" size="md" asChild>
              <Link href="/landlord/applications">Review applications</Link>
            </Button>
            <Button variant="outline" size="md" asChild>
              <Link href="/landlord/rent">Rent payments</Link>
            </Button>
            <Button variant="outline" size="md" asChild>
              <Link href="/messages">Open messages</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

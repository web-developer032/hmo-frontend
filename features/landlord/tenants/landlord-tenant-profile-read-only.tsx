"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { TenantProfile } from "@/lib/types/entities";

function Row({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) {
  const v =
    value === undefined || value === null || value === ""
      ? "—"
      : String(value);
  return (
    <div className="grid gap-1 border-b border-border/60 py-2 last:border-0 sm:grid-cols-[minmax(0,200px)_1fr] sm:gap-4">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="text-sm text-foreground">{v}</dd>
    </div>
  );
}

export function LandlordTenantProfileReadOnly({
  profile,
  backHref,
}: {
  profile: TenantProfile;
  backHref: string;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={backHref}>Back</Link>
        </Button>
      </div>
      <div className="rounded-[var(--radius-md)] border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">
          {profile.fullName}
        </h1>
        {profile.user && (
          <p className="mt-1 text-sm text-muted">{profile.user.email}</p>
        )}
        <dl className="mt-6">
          <Row label="Contact number" value={profile.contactNumber} />
          <Row label="Address" value={profile.address} />
          <Row label="Date of birth" value={profile.dateOfBirth} />
          <Row label="ID document type" value={profile.idDocumentType} />
          <Row label="ID document number" value={profile.idDocumentNumber} />
          <Row label="ID document expiry" value={profile.idDocumentExpiry} />
          <Row label="Employer" value={profile.employerName} />
          <Row label="Job title" value={profile.jobTitle} />
          <Row
            label="Income"
            value={
              profile.income != null ? `£${Number(profile.income).toFixed(2)}` : null
            }
          />
          <Row label="Guarantor name" value={profile.guarantorName} />
          <Row label="Guarantor contact" value={profile.guarantorContact} />
        </dl>
      </div>
    </div>
  );
}

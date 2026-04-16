"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetMyApplicationsQuery,
  useSearchListingsQuery,
} from "@/lib/api/endpoints/listing.endpoints";
import {
  PROPERTY_TYPES,
  rentPeriodLabel,
} from "@/lib/forms/property-constants";

export default function TenantListingsSearchPage() {
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");

  const { data, isLoading, isFetching, refetch } = useSearchListingsQuery({
    page: 1,
    limit: 30,
    city: city.trim() || undefined,
    postcode: postcode.trim() || undefined,
    propertyType: propertyType || undefined,
    minRent: minRent.trim() ? Number(minRent) : undefined,
    maxRent: maxRent.trim() ? Number(maxRent) : undefined,
  });
  const { data: myApps } = useGetMyApplicationsQuery({ page: 1, limit: 100 });
  const latestStatusByListingId = new Map<string, string>();
  for (const app of myApps?.data ?? []) {
    if (!latestStatusByListingId.has(app.listingId)) {
      latestStatusByListingId.set(app.listingId, app.status);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden bg-[linear-gradient(145deg,rgba(31,76,107,0.98),rgba(95,131,152,0.84))] text-white">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/64">
            Tenant discovery
          </p>
          <CardTitle className="text-4xl text-white">
            Find your next place
          </CardTitle>
          <CardDescription className="max-w-2xl text-white/76">
            The original Figma kit only provided mobile discovery patterns, so
            this page adapts that softer card language into a fuller desktop
            search and browsing experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-white">City</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-white text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Postcode</Label>
              <Input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="bg-white text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Type</Label>
              <select
                className="flex h-14 w-full rounded-[20px] border border-transparent bg-white px-4 text-sm text-foreground shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--border)_85%,white)] outline-none"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">Any property</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Min rent</Label>
              <Input
                type="number"
                value={minRent}
                onChange={(e) => setMinRent(e.target.value)}
                className="bg-white text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Max rent</Label>
              <Input
                type="number"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
                className="bg-white text-foreground"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => void refetch()}
              >
                Search listings
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-white/58">
                Inventory
              </p>
              <p className="mt-3 text-3xl font-bold">
                {data?.data?.length ?? 0}
              </p>
              <p className="mt-2 text-sm text-white/74">
                Listings currently matching your filter set.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-white/58">
                Experience
              </p>
              <p className="mt-3 text-3xl font-bold">Desktop</p>
              <p className="mt-2 text-sm text-white/74">
                Adapted from a mobile-first visual kit.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-white/58">
                Status
              </p>
              <p className="mt-3 text-3xl font-bold">Live</p>
              <p className="mt-2 text-sm text-white/74">
                Search hooks and listing APIs remain intact.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading || isFetching ? (
        <p className="text-sm text-muted">Loading listings...</p>
      ) : null}

      {data?.data?.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {data.data.map((l) => (
            <Card key={l.id} className="overflow-hidden">
              <CardContent className="grid gap-5 p-5 sm:grid-cols-[220px_1fr] sm:p-6">
                <div className="flex min-h-[210px] flex-col justify-between rounded-[26px] bg-[linear-gradient(145deg,rgba(31,76,107,1),rgba(139,200,63,0.76))] p-4 text-white">
                  <span className="inline-flex w-fit rounded-full bg-white/14 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/82">
                    {l.property?.propertyType ?? "Property"}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/62">
                      From
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                      GBP {Number(l.rentAmount).toFixed(0)}
                    </p>
                    <p className="mt-1 text-sm text-white/76">
                      {rentPeriodLabel(l.rentFrequency)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-(--hero)">
                      Listing
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-foreground">
                      {l.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      {l.property?.city}, {l.property?.postcode}
                      {l.room ? ` | Room ${l.room.roomNumber}` : ""}
                    </p>
                    {l.room && (
                      <p className="mt-1 text-sm text-muted">
                        Sharing:{" "}
                        {l.room.allowsMultipleTenants
                          ? `Yes (max ${l.room.maxTenants ?? 2})`
                          : "No"}
                      </p>
                    )}
                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted">
                      {l.summary?.trim() ||
                        "A well-presented listing ready for tenant applications through the HMO platform."}
                    </p>
                    {latestStatusByListingId.get(l.id) && (
                      <p className="mt-3 text-sm font-medium text-primary">
                        Application{" "}
                        {latestStatusByListingId.get(l.id)?.toLowerCase()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary" size="md" asChild>
                      <Link href={`/tenant/listings/${l.id}`}>
                        View details
                      </Link>
                    </Button>
                    <Button variant="secondary" size="md">
                      Save for later
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {!isLoading && data?.data?.length === 0 && (
        <Card>
          <CardContent className="py-14 text-center">
            <p className="text-2xl font-bold text-foreground">
              No listings match those filters
            </p>
            <p className="mt-3 text-sm text-muted">
              Try broadening the location or rent range to uncover more results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

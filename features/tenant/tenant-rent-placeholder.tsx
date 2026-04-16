import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TenantRentPlaceholder() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Rent"
        description="Your rent activity — more detail when tenant rent APIs ship."
      />
      <Card>
        <CardHeader>
          <CardTitle>Landlord-managed payments</CardTitle>
          <CardDescription>
            Tenant-facing rent history and card payments are not exposed on this
            API yet. Use{" "}
            <span className="font-medium text-foreground">Messages</span> to
            reach your landlord, or check your tenancy agreement for payment
            details.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted">
          When backend adds tenant rent endpoints, this page will list due dates
          and receipts here without changing the rest of the app shell.
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateRentPaymentMutation,
  useDeleteRentPaymentMutation,
  useGetRentPaymentsQuery,
  useGetRentSummaryQuery,
  useUpdateRentPaymentMutation,
} from "@/lib/api/endpoints/rent.endpoints";
import { useGetTenanciesQuery } from "@/lib/api/endpoints/tenant.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { DataTable } from "@/components/table/data-table";
import { formatTenancySummary } from "@/lib/tenancy/tenancy-display";
import { cn } from "@/lib/utils/cn";
import type { ColumnDef } from "@tanstack/react-table";
import type { RentPayment } from "@/lib/types/entities";

const STATUSES = ["Paid", "Pending", "Overdue"] as const;

const rentSelectClass =
  "flex h-10 min-w-[260px] max-w-full rounded-md border border-[var(--border-design)] bg-card px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background";

export function LandlordRentView() {
  const { data: tenanciesData } = useGetTenanciesQuery({
    page: 1,
    limit: 100,
  });
  const tenancies = tenanciesData?.data ?? [];

  const { data: summary } = useGetRentSummaryQuery();
  const { data: list, isLoading } = useGetRentPaymentsQuery({
    page: 1,
    limit: 50,
  });
  const [createPayment] = useCreateRentPaymentMutation();
  const [updatePayment] = useUpdateRentPaymentMutation();
  const [deletePayment] = useDeleteRentPaymentMutation();

  const [tenancyId, setTenancyId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<string>(STATUSES[1]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [paymentToToggle, setPaymentToToggle] = useState<RentPayment | null>(
    null,
  );

  const paymentColumns = useMemo<ColumnDef<RentPayment>[]>(
    () => [
      {
        id: "tenancy",
        header: "Tenancy",
        cell: ({ row }) => {
          const t = row.original.tenancy;
          if (t) {
            return (
              <span className="text-sm text-foreground">
                {formatTenancySummary(t)}
              </span>
            );
          }
          return (
            <span className="font-mono text-xs text-muted">
              {row.original.tenancyId.slice(0, 8)}…
            </span>
          );
        },
      },
      {
        id: "due",
        header: "Due",
        cell: ({ row }) => String(row.original.dueDate).slice(0, 10),
      },
      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => `£${Number(row.original.amount).toFixed(2)}`,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => row.original.status,
      },
      {
        id: "actions",
        header: "Actions",
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right",
        },
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPaymentToToggle(p)}
              >
                Toggle paid
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(p.id)}
              >
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  async function add() {
    if (!tenancyId.trim()) {
      toast.error("Choose a tenancy");
      return;
    }
    try {
      await createPayment({
        tenancyId: tenancyId.trim(),
        amount: Number(amount),
        dueDate,
        status,
      }).unwrap();
      toast.success("Payment recorded");
      setTenancyId("");
      setAmount("");
      setDueDate("");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete rent payment?"
        description="This removes the payment record. This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await deletePayment(deleteId).unwrap();
            toast.success("Deleted");
          } catch (e) {
            toast.error(getErrorMessage(e));
          }
        }}
      />
      <ConfirmDialog
        open={paymentToToggle != null}
        onOpenChange={(open) => {
          if (!open) setPaymentToToggle(null);
        }}
        title="Update payment status?"
        description={
          paymentToToggle
            ? paymentToToggle.status === "Paid"
              ? "Mark this record as not paid (pending)?"
              : "Mark this record as paid?"
            : ""
        }
        confirmLabel="Update"
        onConfirm={async () => {
          if (!paymentToToggle) return;
          try {
            await updatePayment({
              id: paymentToToggle.id,
              body: {
                status:
                  paymentToToggle.status === "Paid" ? "Pending" : "Paid",
              },
            }).unwrap();
            toast.success("Updated");
          } catch (e) {
            toast.error(getErrorMessage(e));
          }
        }}
      />
      <PageHeader
        title="Rent"
        description="Track expected versus received rent, log payment records, and keep the tenancy-led rent picture visible."
      />

      {summary?.data && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Expected</CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold">
              £{Number(summary.data.totalExpectedRent).toFixed(2)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Received</CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold">
              £{Number(summary.data.totalReceivedRent).toFixed(2)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Overdue</CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold text-destructive">
              £{Number(summary.data.totalOverdueRent).toFixed(2)}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Why this matters</CardTitle>
          <CardDescription>
            The product is designed around bank transfer rent with Open Banking
            matching. Even before automatic matching is fully surfaced, landlords
            need a clear expected-versus-received ledger view.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add payment</CardTitle>
          <CardDescription>
            Choose the tenancy (tenant and property). You do not need to copy
            internal IDs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="rent-tenancy">Tenancy</Label>
            <select
              id="rent-tenancy"
              className={cn(rentSelectClass)}
              value={tenancyId}
              onChange={(e) => setTenancyId(e.target.value)}
            >
              <option value="">Select tenancy…</option>
              {tenancies.map((t) => (
                <option key={t.id} value={t.id}>
                  {formatTenancySummary(t)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Amount £</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Due date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <select
              className="flex h-10 rounded-md border border-border bg-background px-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="primary"
            className="self-end"
            onClick={() => void add()}
          >
            Add
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>
            Manual rent records until matched payment automation is fully exposed
            in the UI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={paymentColumns}
            data={list?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No payments yet."
            getRowId={(p) => p.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

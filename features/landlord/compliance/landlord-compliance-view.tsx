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
import { LandlordPropertySelect } from "@/components/forms/landlord-property-selects";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateComplianceRecordMutation,
  useDeleteComplianceRecordMutation,
  useGetComplianceRecordsQuery,
} from "@/lib/api/endpoints/compliance.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { COMPLIANCE_DOC_TYPES } from "@/lib/forms/compliance-constants";
import { DataTable } from "@/components/table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ComplianceRecord } from "@/lib/types/entities";

export function LandlordComplianceView() {
  const { data, isLoading } = useGetComplianceRecordsQuery({
    page: 1,
    limit: 50,
  });
  const [createRec] = useCreateComplianceRecordMutation();
  const [deleteRec] = useDeleteComplianceRecordMutation();

  const [propertyId, setPropertyId] = useState("");
  const [documentType, setDocumentType] = useState<string>(
    COMPLIANCE_DOC_TYPES[0],
  );
  const [documentReference, setDocumentReference] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const complianceColumns = useMemo<ColumnDef<ComplianceRecord>[]>(
    () => [
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => row.original.documentType,
      },
      {
        id: "ref",
        header: "Ref",
        cell: ({ row }) => row.original.documentReference,
      },
      {
        id: "expires",
        header: "Expires",
        cell: ({ row }) =>
          String(row.original.expiryDate).slice(0, 10),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row.original.id)}
          >
            Delete
          </Button>
        ),
      },
    ],
    []
  );

  async function add() {
    if (!propertyId.trim()) {
      toast.error("Select a property");
      return;
    }
    try {
      await createRec({
        propertyId: propertyId.trim(),
        documentType,
        documentReference,
        issueDate,
        expiryDate,
        documentUrl: documentUrl || undefined,
      }).unwrap();
      toast.success("Record added");
      setPropertyId("");
      setDocumentReference("");
      setIssueDate("");
      setExpiryDate("");
      setDocumentUrl("");
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
        title="Delete compliance record?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await deleteRec(deleteId).unwrap();
            toast.success("Deleted");
          } catch (e) {
            toast.error(getErrorMessage(e));
          }
        }}
      />
      <PageHeader
        title="Compliance"
        description="Track document types, expiry dates, and renewal visibility across the property portfolio."
      />

      <Card>
        <CardHeader>
          <CardTitle>Compliance-first workflow</CardTitle>
          <CardDescription>
            The docs position compliance as a core product differentiator. This
            screen keeps renewals, references, and property linkage visible so
            landlords can act before obligations lapse.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New record</CardTitle>
          <CardDescription>
            Link each compliance item to a property so expiry and renewal can be
            tracked in the right context.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <LandlordPropertySelect
            value={propertyId}
            onChange={setPropertyId}
            label="Property"
          />
          <div className="space-y-1">
            <Label className="text-xs">Type</Label>
            <select
              className="flex h-10 rounded-md border border-border bg-background px-2 text-sm"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              {COMPLIANCE_DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Reference</Label>
            <Input
              value={documentReference}
              onChange={(e) => setDocumentReference(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Issue</Label>
            <Input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Expiry</Label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
          <div className="min-w-[200px] space-y-1">
            <Label className="text-xs">Document URL (optional)</Label>
            <Input
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="primary"
            className="self-end"
            onClick={() => void add()}
          >
            Save
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
          <CardDescription>
            Certificates, references, and other compliance items already logged.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={complianceColumns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No records yet."
            getRowId={(r) => r.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

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
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentsQuery,
  useLandlordAgreeDocumentMutation,
  useUploadDocumentFileMutation,
} from "@/lib/api/endpoints/document.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { openDocumentFileUrl } from "@/lib/api/open-document-file";
import { useAppSelector } from "@/lib/hooks";
import { DOCUMENT_TYPES } from "@/lib/forms/document-constants";
import { DataTable } from "@/components/table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { HmoDocument } from "@/lib/types/entities";

export function LandlordDocumentsView() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data, isLoading } = useGetDocumentsQuery({ page: 1, limit: 50 });
  const [createDoc] = useCreateDocumentMutation();
  const [uploadFile, { isLoading: uploading }] =
    useUploadDocumentFileMutation();
  const [deleteDoc] = useDeleteDocumentMutation();
  const [landlordAgree] = useLandlordAgreeDocumentMutation();

  const [propertyId, setPropertyId] = useState("");
  const [documentType, setDocumentType] = useState<string>(DOCUMENT_TYPES[0]);
  const [documentName, setDocumentName] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [agreeTarget, setAgreeTarget] = useState<{
    id: string;
    documentName: string;
  } | null>(null);

  const docColumns = useMemo<ColumnDef<HmoDocument>[]>(() => {
    const token = accessToken;
    return [
      { id: "name", header: "Name", cell: ({ row }) => row.original.documentName },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => row.original.documentType,
      },
      {
        id: "link",
        header: "Link",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() =>
                void openDocumentFileUrl(row.original.documentUrl, token)
              }
            >
              Open
            </button>
          </div>
        ),
      },
      {
        id: "agreement",
        header: "Agreement",
        cell: ({ row }) => {
          const d = row.original;
          return (
            <span className="text-xs">
              Tenant: {d.tenantAgreed ? "Agreed" : "Pending"} · Landlord:{" "}
              {d.landlordAgreed ? "Agreed" : "Pending"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right",
        },
        cell: ({ row }) => {
          const d = row.original;
          return (
            <div className="space-x-1">
              {!d.landlordAgreed && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAgreeTarget({ id: d.id, documentName: d.documentName })
                  }
                >
                  Mark agreed
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(d.id)}
              >
                Delete
              </Button>
            </div>
          );
        },
      },
    ];
  }, [accessToken]);

  async function add() {
    if (!propertyId.trim()) {
      toast.error("Select a property");
      return;
    }
    try {
      await createDoc({
        propertyId: propertyId.trim(),
        documentType,
        documentName,
        documentUrl,
        expiryDate: expiryDate || undefined,
      }).unwrap();
      toast.success("Document added");
      setPropertyId("");
      setDocumentName("");
      setDocumentUrl("");
      setExpiryDate("");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ConfirmDialog
        open={agreeTarget != null}
        onOpenChange={(open) => {
          if (!open) setAgreeTarget(null);
        }}
        title="Record your agreement?"
        description={
          agreeTarget
            ? `Confirm you agree to “${agreeTarget.documentName}”. This is recorded for compliance.`
            : ""
        }
        confirmLabel="I agree"
        onConfirm={async () => {
          if (!agreeTarget) return;
          try {
            await landlordAgree(agreeTarget.id).unwrap();
            toast.success("Marked as landlord-agreed");
          } catch (e) {
            toast.error(getErrorMessage(e));
          }
        }}
      />
      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete document?"
        description="This removes the document record. This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await deleteDoc(deleteId).unwrap();
            toast.success("Deleted");
          } catch (e) {
            toast.error(getErrorMessage(e));
          }
        }}
      />
      <PageHeader
        title="Documents"
        description="Upload files to the API server or paste an external document URL."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add document</CardTitle>
          <CardDescription>
            Upload a file (stored on the API host under{" "}
            <code className="text-xs">uploads/documents</code>) or enter a URL
            manually.
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
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Name</Label>
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>
          <div className="min-w-[220px] space-y-1">
            <Label className="text-xs">File (optional)</Label>
            <Input
              type="file"
              className="h-10 cursor-pointer text-sm"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const res = await uploadFile(f).unwrap();
                  setDocumentUrl(res.data.documentUrl);
                  setDocumentName((prev) =>
                    prev.trim() ? prev : f.name.replace(/\.[^.]+$/, "")
                  );
                  toast.success("File uploaded");
                } catch (err) {
                  toast.error(getErrorMessage(err));
                } finally {
                  e.target.value = "";
                }
              }}
              disabled={uploading}
            />
          </div>
          <div className="min-w-[220px] space-y-1">
            <Label className="text-xs">Document URL</Label>
            <Input
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="Filled after upload or paste external link"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Expiry (optional)</Label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
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
          <CardTitle>Library</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={docColumns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No documents yet."
            getRowId={(d) => d.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

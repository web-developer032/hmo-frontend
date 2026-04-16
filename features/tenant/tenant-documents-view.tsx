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
import {
  useGetDocumentsQuery,
  useTenantAgreeDocumentMutation,
} from "@/lib/api/endpoints/document.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { openDocumentFileUrl } from "@/lib/api/open-document-file";
import { useAppSelector } from "@/lib/hooks";
import { DataTable } from "@/components/table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { HmoDocument } from "@/lib/types/entities";

export function TenantDocumentsView() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data, isLoading } = useGetDocumentsQuery({
    page: 1,
    limit: 50,
  });
  const [tenantAgree] = useTenantAgreeDocumentMutation();
  const [agreeTarget, setAgreeTarget] = useState<{
    id: string;
    documentName: string;
  } | null>(null);

  const tenantDocColumns = useMemo<ColumnDef<HmoDocument>[]>(() => {
    const token = accessToken;
    return [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => row.original.documentName,
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => row.original.documentType,
      },
      {
        id: "link",
        header: "Link",
        cell: ({ row }) => (
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() =>
              void openDocumentFileUrl(row.original.documentUrl, token)
            }
          >
            Open
          </button>
        ),
      },
      {
        id: "agreement",
        header: "Agreement",
        cell: ({ row }) => {
          const d = row.original;
          return (
            <div className="space-x-2 text-xs">
              <span>
                Tenant: {d.tenantAgreed ? "Agreed" : "Pending"} · Landlord:{" "}
                {d.landlordAgreed ? "Agreed" : "Pending"}
              </span>
              {!d.tenantAgreed && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 text-primary hover:text-primary"
                  onClick={() =>
                    setAgreeTarget({ id: d.id, documentName: d.documentName })
                  }
                >
                  Agree
                </Button>
              )}
            </div>
          );
        },
      },
    ];
  }, [accessToken]);

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
            await tenantAgree(agreeTarget.id).unwrap();
            toast.success("Marked as agreed");
          } catch (e) {
            toast.error(getErrorMessage(e));
          }
        }}
      />
      <PageHeader
        title="Documents"
        description="Files and agreements shared with you."
      />

      <Card>
        <CardHeader>
          <CardTitle>Your documents</CardTitle>
          <CardDescription>
            Files linked to you or to your tenancies only (not other
            tenants&apos; paperwork).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tenantDocColumns}
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

"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/error-message";
import {
  useGetDocumentsQuery,
  useLandlordAgreeDocumentMutation,
} from "@/lib/api/endpoints/document.endpoints";

export function ApplicationTenancyDocuments({
  tenancyId,
  actionsDisabled,
}: {
  tenancyId: string;
  actionsDisabled?: boolean;
}) {
  const { data, isLoading } = useGetDocumentsQuery(
    { tenancyId, page: 1, limit: 50 },
    { skip: !tenancyId }
  );
  const [landlordAgree, { isLoading: agreeing }] =
    useLandlordAgreeDocumentMutation();
  const [busyDocId, setBusyDocId] = useState<string | null>(null);
  const [agreeTarget, setAgreeTarget] = useState<{
    id: string;
    documentName: string;
  } | null>(null);

  const docs = data?.data ?? [];

  async function confirmAgree() {
    if (!agreeTarget) return;
    setBusyDocId(agreeTarget.id);
    try {
      await landlordAgree(agreeTarget.id).unwrap();
      toast.success("Recorded your agreement");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusyDocId(null);
    }
  }

  if (!tenancyId) return null;

  return (
    <div className="space-y-3 rounded-md border border-(--border-design) bg-(--paper-2) p-4">
      <ConfirmDialog
        open={agreeTarget != null}
        onOpenChange={(open) => {
          if (!open) setAgreeTarget(null);
        }}
        title="Record your agreement?"
        description={
          agreeTarget
            ? `Confirm you agree to “${agreeTarget.documentName}”. Both parties must agree before starting the tenancy.`
            : ""
        }
        confirmLabel="I agree"
        onConfirm={() => void confirmAgree()}
      />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Tenancy documents
          </p>
          <p className="text-xs text-muted">
            Agree here or in{" "}
            <Link
              href="/landlord/documents"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Documents
            </Link>
            . Both parties must agree before you can start the tenancy.
          </p>
        </div>
      </div>
      {isLoading && <p className="text-xs text-muted">Loading documents…</p>}
      {!isLoading && docs.length === 0 && (
        <p className="text-xs text-muted">No documents linked yet.</p>
      )}
      <ul className="space-y-2">
        {docs.map((d) => (
          <li
            key={d.id}
            className="flex flex-col gap-2 rounded-md border border-[var(--border-design)] bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {d.documentName}
              </p>
              <p className="text-xs text-muted">{d.documentType}</p>
              <p className="mt-1 text-xs text-muted">
                Landlord: {d.landlordAgreed ? "agreed" : "not yet"} · Tenant:{" "}
                {d.tenantAgreed ? "agreed" : "not yet"}
              </p>
            </div>
            {!d.landlordAgreed && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0"
                disabled={actionsDisabled || agreeing || busyDocId === d.id}
                onClick={() =>
                  setAgreeTarget({ id: d.id, documentName: d.documentName })
                }
              >
                {busyDocId === d.id ? "Saving…" : "I agree (landlord)"}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

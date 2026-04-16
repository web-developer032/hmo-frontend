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
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
} from "@/lib/api/endpoints/user.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { Role } from "@/lib/constants/roles";
import { DataTable } from "@/components/table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { AdminUserRow } from "@/lib/types/entities";

const ROLES = [Role.Admin, Role.Landlord, Role.Tenant] as const;

export function UsersAdminView() {
  const { data, isLoading } = useGetUsersQuery({ page: 1, limit: 50 });
  const [createUser] = useCreateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rolePick, setRolePick] = useState<string>(Role.Tenant);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const userColumns = useMemo<ColumnDef<AdminUserRow>[]>(
    () => [
      { id: "name", header: "Name", cell: ({ row }) => row.original.name },
      { id: "email", header: "Email", cell: ({ row }) => row.original.email },
      {
        id: "roles",
        header: "Roles",
        cell: ({ row }) => row.original.roles.join(", "),
      },
      {
        id: "id",
        header: "User ID",
        meta: { cellClassName: "text-right font-mono text-xs" },
        cell: ({ row }) => row.original.id,
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
            onClick={() => setDeleteUserId(row.original.id)}
          >
            Delete
          </Button>
        ),
      },
    ],
    []
  );

  async function add() {
    try {
      await createUser({
        name,
        email,
        password,
        roles: [rolePick],
      }).unwrap();
      toast.success("User created");
      setName("");
      setEmail("");
      setPassword("");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ConfirmDialog
        open={deleteUserId != null}
        onOpenChange={(open) => {
          if (!open) setDeleteUserId(null);
        }}
        title="Delete user?"
        description="This permanently removes the user account."
        confirmLabel="Delete user"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteUserId) return;
          try {
            await deleteUser(deleteUserId).unwrap();
            toast.success("Deleted");
          } catch (e) {
            toast.error(getErrorMessage(e));
          }
        }}
      />
      <PageHeader
        title="Users"
        description="Admin user management — create accounts and review the directory."
      />

      <Card>
        <CardHeader>
          <CardTitle>Create user</CardTitle>
          <CardDescription>Minimum fields for a new account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Role</Label>
            <select
              className="flex h-10 rounded-md border border-border bg-background px-2 text-sm"
              value={rolePick}
              onChange={(e) => setRolePick(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
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
            Create
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={userColumns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No users yet."
            getRowId={(u) => u.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

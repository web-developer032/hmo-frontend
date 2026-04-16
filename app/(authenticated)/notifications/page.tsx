"use client";

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
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from "@/lib/api/endpoints/notification.endpoints";

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery({ page: 1, limit: 50 });
  const [markRead] = useMarkNotificationReadMutation();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Notifications"
        description="Application, document, and tenancy lifecycle updates."
      />
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>Newest first</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted">Loading...</p>}
          <ul className="space-y-3">
            {(data?.data ?? []).map((n) => (
              <li key={n.id} className="rounded-md border border-border p-3">
                <p className="text-sm font-semibold">{n.subject}</p>
                <p className="mt-1 text-sm text-muted">{n.body}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                  <span>{n.status}</span>
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                  {!n.readAt && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void markRead(n.id)}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {!isLoading && (data?.data?.length ?? 0) === 0 && (
            <p className="text-sm text-muted">No notifications yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  useCreateMessageMutation,
  useCreateThreadMessageMutation,
  useGetAdminTenancyThreadsQuery,
  useGetConversationMessagesQuery,
  useGetConversationPartnersQuery,
  useGetSupportContactQuery,
  useGetTenancyChatSummariesQuery,
  useGetThreadMessagesQuery,
  useOpenTenancyThreadMutation,
} from "@/lib/api/endpoints/messaging.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { Role } from "@/lib/constants/roles";
import { useThreadSocket } from "@/lib/messaging/use-thread-socket";
import { cn } from "@/lib/utils/cn";
import { useAppSelector } from "@/lib/hooks";
import type {
  AdminTenancyThreadRow,
  ConversationPartner,
  HmoMessage,
  TenancyChatSummaryRow,
} from "@/lib/types/entities";

function peerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatChatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function sortMessagesChronological(msgs: HmoMessage[] | undefined) {
  if (!msgs?.length) return [];
  return [...msgs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

type ChatPanel =
  | { mode: "dm"; partnerId: string }
  | {
      mode: "tenancy";
      tenancyId: string;
      conversationId: string;
      chatTitle: string;
      subtitle: string;
    }
  | null;

export function MessagesView() {
  const me = useAppSelector((s) => s.auth.user);
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const isLandlord = me?.roles?.includes(Role.Landlord) ?? false;
  const isTenant = me?.roles?.includes(Role.Tenant) ?? false;
  const isAdmin = me?.roles?.includes(Role.Admin) ?? false;
  const showLandlordTenantTenancies = !isAdmin && (isLandlord || isTenant);

  const { data: partnersRes } = useGetConversationPartnersQuery();
  const list = useMemo(() => partnersRes?.data ?? [], [partnersRes?.data]);
  const { data: supportRes } = useGetSupportContactQuery(undefined, {
    skip: isAdmin || (!isLandlord && !isTenant),
  });
  const support = supportRes?.data ?? null;
  const { data: adminThreadsRes } = useGetAdminTenancyThreadsQuery(undefined, {
    skip: !isAdmin,
  });
  const adminTenancyThreads = adminThreadsRes?.data ?? [];
  const { data: tenancySummariesRes } = useGetTenancyChatSummariesQuery(
    undefined,
    { skip: !showLandlordTenantTenancies },
  );
  const tenancySummaries = tenancySummariesRes?.data ?? [];

  const [panel, setPanel] = useState<ChatPanel>(null);
  const [tenancyConvIds, setTenancyConvIds] = useState<Record<string, string>>(
    {}
  );
  const [composer, setComposer] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePartner = useMemo(
    () =>
      panel?.mode === "dm"
        ? list.find((p) => p.id === panel.partnerId)
        : undefined,
    [list, panel]
  );

  const dmConversationId = activePartner?.conversationId ?? null;

  const { data: dmThread, isFetching: dmLoading } =
    useGetConversationMessagesQuery(
      {
        conversationPartnerId: panel?.mode === "dm" ? panel.partnerId : "",
        dmConversationId,
        page: 1,
        limit: 80,
      },
      { skip: panel?.mode !== "dm" || !panel.partnerId }
    );

  const tenancyConversationId =
    panel?.mode === "tenancy" ? panel.conversationId : "";

  const { data: tenancyThread, isFetching: tenancyLoading } =
    useGetThreadMessagesQuery(
      {
        conversationId: tenancyConversationId,
        page: 1,
        limit: 80,
      },
      { skip: panel?.mode !== "tenancy" || !tenancyConversationId }
    );

  const socketConversationId =
    panel?.mode === "tenancy"
      ? panel.conversationId
      : panel?.mode === "dm"
      ? dmConversationId
      : null;

  useThreadSocket(socketConversationId, accessToken);

  const [sendDm] = useCreateMessageMutation();
  const [sendThread] = useCreateThreadMessageMutation();
  const [openTenancyThread, { isLoading: tenancyOpening }] =
    useOpenTenancyThreadMutation();

  const dmPartners = useMemo(() => {
    if (!support?.id) return list;
    return list.filter((p) => p.id !== support.id);
  }, [list, support]);

  const dmMessages = useMemo(
    () => sortMessagesChronological(dmThread?.data),
    [dmThread?.data]
  );
  const threadMessages = useMemo(
    () => sortMessagesChronological(tenancyThread?.data),
    [tenancyThread?.data]
  );

  const displayMessages = panel?.mode === "dm" ? dmMessages : threadMessages;
  const messagesLoading =
    panel?.mode === "dm"
      ? dmLoading
      : panel?.mode === "tenancy"
      ? tenancyLoading
      : false;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, panel]);

  async function openTenancyFromSummary(row: TenancyChatSummaryRow) {
    let cid = row.conversationId ?? tenancyConvIds[row.tenancyId] ?? null;
    try {
      if (!cid) {
        const res = await openTenancyThread(row.tenancyId).unwrap();
        cid = (res.data as { id: string }).id;
      }
      setTenancyConvIds((prev) => ({ ...prev, [row.tenancyId]: cid! }));
      setPanel({
        mode: "tenancy",
        tenancyId: row.tenancyId,
        conversationId: cid!,
        chatTitle: row.title,
        subtitle: row.summary,
      });
      setComposer("");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function sendNow() {
    const text = composer.trim();
    if (!text || !me || !panel) return;
    try {
      if (panel.mode === "dm") {
        await sendDm({
          senderId: me.id,
          receiverId: panel.partnerId,
          content: text,
        }).unwrap();
      } else {
        await sendThread({
          conversationId: panel.conversationId,
          content: text,
        }).unwrap();
      }
      setComposer("");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  function openAdminTenancyRow(row: AdminTenancyThreadRow) {
    setTenancyConvIds((prev) => ({
      ...prev,
      [row.tenancyId]: row.conversationId,
    }));
    setPanel({
      mode: "tenancy",
      tenancyId: row.tenancyId,
      conversationId: row.conversationId,
      chatTitle: row.title,
      subtitle: row.summary,
    });
    setComposer("");
  }

  const supportChat =
    panel?.mode === "dm" && support && panel.partnerId === support.id;

  const headerTitle =
    panel?.mode === "dm"
      ? supportChat
        ? "Platform support"
        : activePartner?.name ?? "Chat"
      : panel?.mode === "tenancy"
        ? panel.chatTitle
        : "";
  const headerSubtitle =
    panel?.mode === "dm"
      ? supportChat
        ? support?.email ?? ""
        : activePartner?.email ?? ""
      : panel?.mode === "tenancy"
      ? panel.subtitle
      : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description={
          isAdmin
            ? "Review tenancy threads between landlords and tenants, and use direct messages for support inboxes."
            : "Message your landlord or tenant only inside each tenancy thread. Use Platform support to reach the team (admin)."
        }
      />

      <div
        className={cn(
          "mx-auto flex max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
          "h-[min(720px,calc(100dvh-9rem))] max-md:h-[min(640px,calc(100dvh-8rem))]"
        )}
      >
        {/* Sidebar — chat list (WhatsApp-style) */}
        <aside
          className={cn(
            "flex w-full min-w-0 flex-col border-border md:w-[min(100%,340px)] md:shrink-0 md:border-r",
            panel != null && "max-md:hidden"
          )}
        >
          <div className="border-b border-border bg-muted/25 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Chats</p>
            <p className="text-xs text-muted">
              {isAdmin
                ? "Tenancy threads (moderation) and your direct inboxes."
                : "One thread per tenancy with your landlord. Support is direct only."}
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isAdmin && (
              <div className="border-b border-border px-2 py-2">
                <p className="px-2 pb-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                  Tenancy threads
                </p>
                {adminTenancyThreads.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted">
                    No tenancy group chats yet. They appear after a landlord or
                    tenant opens a thread for that tenancy.
                  </p>
                ) : (
                  <ul className="space-y-0.5">
                    {adminTenancyThreads.map((row) => {
                      const active =
                        panel?.mode === "tenancy" &&
                        panel.tenancyId === row.tenancyId;
                      return (
                        <li key={row.conversationId}>
                          <button
                            type="button"
                            className={cn(
                              "flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                              active
                                ? "bg-primary/12 text-foreground"
                                : "hover:bg-muted/70"
                            )}
                            onClick={() => openAdminTenancyRow(row)}
                          >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                              🏠
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium leading-tight">
                                {row.title}
                              </span>
                              <span className="mt-0.5 line-clamp-2 text-xs text-muted">
                                {row.summary}
                              </span>
                              {row.lastMessageAt && (
                                <span className="mt-0.5 block text-[0.65rem] text-muted">
                                  Last:{" "}
                                  {new Date(row.lastMessageAt).toLocaleString()}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {showLandlordTenantTenancies && (
              <div className="border-b border-border px-2 py-2">
                <p className="px-2 pb-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                  Your tenancy threads
                </p>
                {tenancySummaries.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted">
                    No tenancies on your account yet. When you have an active
                    tenancy, open its thread here to message your{" "}
                    {isLandlord ? "tenant" : "landlord"}.
                  </p>
                ) : (
                  <ul className="space-y-0.5">
                    {tenancySummaries.map((row) => {
                      const active =
                        panel?.mode === "tenancy" &&
                        panel.tenancyId === row.tenancyId;
                      return (
                        <li key={row.tenancyId}>
                          <button
                            type="button"
                            className={cn(
                              "flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                              active
                                ? "bg-primary/12 text-foreground"
                                : "hover:bg-muted/70"
                            )}
                            onClick={() => void openTenancyFromSummary(row)}
                            disabled={tenancyOpening}
                          >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                              🏠
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium leading-tight">
                                {row.title}
                              </span>
                              <span className="mt-0.5 line-clamp-2 text-xs text-muted">
                                {row.summary}
                              </span>
                              {row.lastMessageAt && (
                                <span className="mt-0.5 block text-[0.65rem] text-muted">
                                  Last:{" "}
                                  {new Date(row.lastMessageAt).toLocaleString()}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            <div className="px-2 py-2">
              <p className="px-2 pb-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                {isAdmin ? "Direct messages" : "Support & direct"}
              </p>
              {!isAdmin && (isLandlord || isTenant) && (
                <div className="mb-2 px-1">
                  {support ? (
                    <button
                      type="button"
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-3 py-2.5 text-left transition-colors",
                        panel?.mode === "dm" && panel.partnerId === support.id
                          ? "border-primary/40 bg-primary/10"
                          : "hover:bg-muted/60"
                      )}
                      onClick={() => {
                        setPanel({ mode: "dm", partnerId: support.id });
                        setComposer("");
                      }}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-sm font-semibold text-amber-700 dark:text-amber-400">
                        ?
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">
                          New: Message support
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {support.name} · {support.email}
                        </span>
                      </span>
                    </button>
                  ) : (
                    <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted">
                      No platform admin is configured yet, so support chat is
                      unavailable.
                    </p>
                  )}
                </div>
              )}
              {dmPartners.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-muted">
                  {isAdmin
                    ? "No direct conversations yet."
                    : "No other direct chats. Use tenancy threads for your landlord or tenant."}
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {dmPartners.map((p: ConversationPartner) => {
                    const active =
                      panel?.mode === "dm" && panel.partnerId === p.id;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                            active
                              ? "bg-primary/12 text-foreground"
                              : "hover:bg-muted/70"
                          )}
                          onClick={() => {
                            setPanel({ mode: "dm", partnerId: p.id });
                            setComposer("");
                          }}
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                            {peerInitials(p.name)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {p.name}
                            </span>
                            <span className="block truncate text-xs text-muted">
                              {p.email}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </aside>

        {/* Main pane */}
        <section
          className={cn(
            "flex min-w-0 flex-1 flex-col bg-[color-mix(in_srgb,var(--muted)_35%,var(--background))]",
            panel == null && "max-md:hidden"
          )}
        >
          {panel == null ? (
            <div className="hidden flex-1 flex-col items-center justify-center gap-2 p-8 text-center md:flex">
              <p className="text-lg font-medium text-foreground">
                Select a chat
              </p>
              <p className="max-w-sm text-sm text-muted">
                {isAdmin
                  ? "Pick a tenancy thread or a direct conversation."
                  : "Open a tenancy thread for your landlord or tenant, or message support."}
              </p>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-2 border-b border-border bg-card/90 px-2 py-2 backdrop-blur-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 md:hidden"
                  onClick={() => setPanel(null)}
                >
                  ← Back
                </Button>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {panel.mode === "tenancy" ? "🏠" : peerInitials(headerTitle)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold leading-tight">
                    {headerTitle}
                  </h2>
                  <p className="truncate text-xs text-muted">
                    {headerSubtitle}
                  </p>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
                {messagesLoading && displayMessages.length === 0 ? (
                  <p className="text-center text-sm text-muted">Loading…</p>
                ) : displayMessages.length === 0 ? (
                  <p className="text-center text-sm text-muted">
                    No messages yet. Say hello below.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {displayMessages.map((m) => {
                      const mine = m.senderId === me?.id;
                      const senderLabel =
                        panel.mode === "tenancy"
                          ? mine
                            ? "You"
                            : m.sender?.name?.trim() || "Participant"
                          : null;
                      return (
                        <div
                          key={m.id}
                          className={cn(
                            "flex w-full",
                            mine ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[min(100%,26rem)] rounded-2xl px-3 py-2 text-sm shadow-sm",
                              mine
                                ? "rounded-br-md bg-primary text-primary-foreground"
                                : "rounded-bl-md border border-border bg-card text-card-foreground"
                            )}
                          >
                            {senderLabel != null && (
                              <p
                                className={cn(
                                  "mb-1 text-[0.7rem] font-semibold leading-none",
                                  mine
                                    ? "text-primary-foreground/90"
                                    : "text-muted",
                                )}
                              >
                                {senderLabel}
                              </p>
                            )}
                            <p className="whitespace-pre-wrap wrap-break-word leading-snug">
                              {m.content || "(attachment)"}
                            </p>
                            <p
                              className={cn(
                                "mt-1 text-[0.65rem] tabular-nums",
                                mine
                                  ? "text-primary-foreground/75"
                                  : "text-muted"
                              )}
                            >
                              {formatChatTime(m.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <footer className="border-t border-border bg-card/95 p-2 backdrop-blur-sm">
                <div className="flex items-end gap-2">
                  <textarea
                    className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none ring-ring/40 transition-shadow focus-visible:ring-2"
                    placeholder={
                      panel.mode === "dm"
                        ? supportChat
                          ? "Message support…"
                          : "Message…"
                        : "Message in tenancy thread…"
                    }
                    rows={1}
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void sendNow();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="primary"
                    className="shrink-0 rounded-full px-5"
                    onClick={() => void sendNow()}
                    disabled={!composer.trim()}
                  >
                    Send
                  </Button>
                </div>
                <p className="mt-1 px-1 text-[0.65rem] text-muted">
                  Enter to send · Shift+Enter for a new line
                </p>
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

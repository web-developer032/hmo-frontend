import { cn } from "@/lib/utils/cn";

const VARIANTS: Record<
  string,
  { className: string; dot?: boolean }
> = {
  active: {
    className: "bg-[var(--accent-light)] text-[var(--accent)]",
    dot: true,
  },
  pending: {
    className: "bg-[var(--amber-light)] text-[var(--amber)]",
    dot: true,
  },
  overdue: {
    className: "bg-[var(--red-light)] text-[var(--red)]",
    dot: true,
  },
  paid: {
    className: "bg-[var(--accent-light)] text-[var(--accent)]",
    dot: true,
  },
  draft: {
    className: "bg-[var(--paper-3)] text-[var(--ink-3)]",
    dot: true,
  },
  published: {
    className: "bg-[var(--accent-light)] text-[var(--accent)]",
    dot: true,
  },
  ended: {
    className: "bg-[var(--paper-3)] text-[var(--ink-3)]",
    dot: true,
  },
  available: {
    className: "bg-[var(--blue-light)] text-[var(--blue)]",
    dot: true,
  },
  notice: {
    className: "bg-[var(--amber-light)] text-[var(--amber)]",
    dot: true,
  },
  open: {
    className: "bg-[var(--red-light)] text-[var(--red)]",
    dot: true,
  },
  resolved: {
    className: "bg-[var(--accent-light)] text-[var(--accent)]",
    dot: true,
  },
  declined: {
    className: "bg-[var(--paper-3)] text-[var(--ink-3)]",
    dot: true,
  },
  accepted: {
    className: "bg-[var(--accent-light)] text-[var(--accent)]",
    dot: true,
  },
  completed: {
    className: "bg-[var(--accent-light)] text-[var(--accent)]",
    dot: true,
  },
  default: {
    className: "bg-[var(--paper-2)] text-[var(--ink-3)]",
    dot: true,
  },
};

function normalizeStatus(status: string): keyof typeof VARIANTS {
  const s = status.toLowerCase().replace(/\s+/g, "");
  if (s.includes("notice")) return "notice";
  if (s === "active") return "active";
  if (s === "pending") return "pending";
  if (s === "overdue" || s === "pastdue") return "overdue";
  if (s === "paid") return "paid";
  if (s === "draft") return "draft";
  if (s === "published") return "published";
  if (s === "ended") return "ended";
  if (s === "available") return "available";
  if (s === "open") return "open";
  if (s === "resolved" || s.includes("progress")) return "resolved";
  if (s === "declined") return "declined";
  if (s === "accepted") return "accepted";
  if (s === "completed") return "completed";
  return "default";
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = normalizeStatus(status);
  const v = VARIANTS[key] ?? VARIANTS.default;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.72rem] font-medium",
        v.className,
        className
      )}
    >
      {v.dot ? (
        <span
          className="size-1.5 shrink-0 rounded-full opacity-70"
          style={{ background: "currentColor" }}
          aria-hidden
        />
      ) : null}
      {status}
    </span>
  );
}

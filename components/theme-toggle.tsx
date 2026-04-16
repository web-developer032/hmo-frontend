"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils/cn";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";

const OPTIONS = ["light", "dark"] as const;

export function ThemeToggle({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "topnav";
}) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useHasMounted();

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-9 w-36 rounded-md border",
          variant === "topnav"
            ? "border-white/15 bg-white/5"
            : "border-border bg-card",
          className
        )}
        aria-hidden
      />
    );
  }

  const isTop = variant === "topnav";

  return (
    <div
      className={cn(
        "inline-flex rounded-md p-0.5",
        isTop
          ? "border border-white/15 bg-white/5"
          : "border border-border bg-card shadow-sm",
        className
      )}
      role="group"
      aria-label="Color theme"
    >
      {OPTIONS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTheme(t)}
          className={cn(
            "rounded px-2.5 py-1.5 text-[0.7rem] font-medium capitalize transition-colors",
            isTop
              ? resolvedTheme === t
                ? "bg-white/15 text-white"
                : "text-white/55 hover:bg-white/10 hover:text-white"
              : resolvedTheme === t
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

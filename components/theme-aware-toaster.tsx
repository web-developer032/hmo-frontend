"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";

export function ThemeAwareToaster() {
  const { resolvedTheme } = useTheme();
  const mounted = useHasMounted();

  let toasterTheme: "light" | "dark" | "system" = "system";
  if (mounted) {
    toasterTheme = resolvedTheme === "dark" ? "dark" : "light";
  }

  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      theme={toasterTheme}
    />
  );
}

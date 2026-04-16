"use client";

import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import { AppShell } from "@/components/app-shell";
import { AuthBootstrap } from "@/components/auth-bootstrap";
import { ThemeAwareToaster } from "@/components/theme-aware-toaster";
import { store } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Provider store={store}>
        <AuthBootstrap>
          <AppShell>{children}</AppShell>
        </AuthBootstrap>
        <ThemeAwareToaster />
      </Provider>
    </ThemeProvider>
  );
}

import { Suspense } from "react";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-design)] bg-card p-8 text-center text-sm text-muted shadow-[var(--shadow-sm)]">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

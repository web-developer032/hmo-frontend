"use client";

import { Formik } from "formik";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FormikInput } from "@/components/formik/formik-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/error-message";
import { useRegisterMutation } from "@/lib/api";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/forms/auth-schemas";

const initialValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  roleLandlord: false,
  roleTenant: false,
};

export function RegisterForm() {
  const searchParams = useSearchParams();
  const [register, { isLoading }] = useRegisterMutation();

  return (
    <Card className="shadow-[var(--shadow-sm)]">
      <CardHeader className="space-y-2 border-0 pb-2">
        <CardTitle className="text-3xl font-normal">Create account</CardTitle>
        <CardDescription>
          Choose at least one role. You can be both a landlord and a tenant.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-2">
        <Formik
          initialValues={initialValues}
          validationSchema={registerSchema}
          validateOnBlur
          validateOnChange={false}
          onSubmit={async (values) => {
            const roles: string[] = [];
            if (values.roleLandlord) roles.push("landlord");
            if (values.roleTenant) roles.push("tenant");
            try {
              await register({
                name: values.name.trim(),
                email: values.email.trim(),
                password: values.password,
                roles,
              }).unwrap();
              toast.success("Account created");
            } catch (err) {
              toast.error(getErrorMessage(err));
            }
          }}
        >
          {({ handleSubmit, isSubmitting, values, setFieldValue, errors }) => (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border-design)] bg-[var(--paper-2)] p-4">
                <p className="text-sm font-semibold text-foreground">
                  Your roles
                </p>
                <p className="text-xs text-muted">
                  Select at least one. Roles control what you can see and do in
                  the app.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-md border border-[var(--border-design)] bg-card px-3 py-2.5 shadow-sm">
                    <input
                      type="checkbox"
                      className="size-4 rounded border border-input accent-primary"
                      checked={values.roleLandlord}
                      onChange={(e) =>
                        setFieldValue("roleLandlord", e.target.checked)
                      }
                    />
                    <span className="text-sm">Landlord</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-md border border-[var(--border-design)] bg-card px-3 py-2.5 shadow-sm">
                    <input
                      type="checkbox"
                      className="size-4 rounded border border-input accent-primary"
                      checked={values.roleTenant}
                      onChange={(e) =>
                        setFieldValue("roleTenant", e.target.checked)
                      }
                    />
                    <span className="text-sm">Tenant</span>
                  </label>
                </div>
                {typeof errors.roleLandlord === "string" ? (
                  <p className="text-xs text-destructive">
                    {errors.roleLandlord}
                  </p>
                ) : null}
              </div>
              <FormikInput
                name="name"
                id="name"
                label="Full name"
                autoComplete="name"
                placeholder="Jane Smith"
              />
              <FormikInput
                name="email"
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
              <FormikInput
                name="password"
                id="password"
                label="Password"
                type="password"
                autoComplete="new-password"
              />
              <FormikInput
                name="confirmPassword"
                id="confirmPassword"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
              />
              <Button
                type="submit"
                className="mt-1 w-full"
                disabled={isSubmitting || isLoading}
                variant="primary"
              >
                {isSubmitting || isLoading
                  ? "Creating account…"
                  : "Create account"}
              </Button>
            </form>
          )}
        </Formik>
        <p className="text-center text-sm text-muted">
          Already registered?{" "}
          <Link
            href={
              searchParams.get("next")
                ? `/login?next=${encodeURIComponent(searchParams.get("next")!)}`
                : "/login"
            }
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

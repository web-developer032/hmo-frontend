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
import { useLoginMutation } from "@/lib/api";
import { loginSchema, type LoginFormValues } from "@/lib/forms/auth-schemas";

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();

  return (
    <Card className="shadow-(--shadow-sm)">
      <CardHeader className="space-y-2 border-0 pb-2">
        <CardTitle className="text-3xl font-normal">Sign in</CardTitle>
        <CardDescription>
          Use your HMO Platform email and password to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-2">
        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          validateOnBlur
          validateOnChange={false}
          onSubmit={async (values) => {
            try {
              await login({
                email: values.email.trim(),
                password: values.password,
              }).unwrap();
              toast.success("Signed in");
            } catch (err) {
              toast.error(getErrorMessage(err));
            }
          }}
        >
          {({ handleSubmit, isSubmitting }) => (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
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
                autoComplete="current-password"
              />
              <Button
                type="submit"
                className="mt-1 w-full"
                disabled={isSubmitting || isLoading}
                variant="primary"
              >
                {isSubmitting || isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          )}
        </Formik>
        <p className="text-center text-sm text-muted">
          <Link
            href="/forgot-password"
            className="text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </p>
        <p className="text-center text-sm text-muted">
          No account?{" "}
          <Link
            href={
              searchParams.get("next")
                ? `/register?next=${encodeURIComponent(
                    searchParams.get("next")!
                  )}`
                : "/register"
            }
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

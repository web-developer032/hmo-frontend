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
import { useResetPasswordMutation } from "@/lib/api";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/forms/auth-schemas";

function tokenFromSearchParams(searchParams: URLSearchParams): string {
  const raw = searchParams.get("token")?.trim() ?? "";
  return raw;
}

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenParam = tokenFromSearchParams(searchParams);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const initialValues: ResetPasswordFormValues = {
    token: tokenParam.length === 64 ? tokenParam : "",
    newPassword: "",
    confirmPassword: "",
  };

  if (!tokenParam) {
    return (
      <Card className="shadow-(--shadow-sm)">
        <CardHeader>
          <CardTitle className="text-2xl font-normal">Reset password</CardTitle>
          <CardDescription>
            This page needs a reset token from your email. Open the link from
            the message, or request a new link below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild variant="primary" className="w-full">
            <Link href="/forgot-password">Request reset link</Link>
          </Button>
          <p className="text-center text-sm text-muted">
            <Link href="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (tokenParam.length !== 64) {
    return (
      <Card className="shadow-(--shadow-sm)">
        <CardHeader>
          <CardTitle className="text-2xl font-normal">Invalid link</CardTitle>
          <CardDescription>
            The reset token in this link is not valid. Request a new password
            reset email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild variant="primary" className="w-full">
            <Link href="/forgot-password">Try again</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-(--shadow-sm)">
      <CardHeader className="space-y-2 border-0 pb-2">
        <CardTitle className="text-3xl font-normal">Set new password</CardTitle>
        <CardDescription>
          Choose a new password. You will be signed in when this succeeds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-2">
        <Formik
          key={tokenParam}
          initialValues={initialValues}
          validationSchema={resetPasswordSchema}
          validateOnBlur
          validateOnChange={false}
          enableReinitialize
          onSubmit={async (values) => {
            try {
              await resetPassword({
                token: values.token.trim(),
                newPassword: values.newPassword,
              }).unwrap();
              toast.success("Password updated — you are signed in.");
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
                name="newPassword"
                id="newPassword"
                label="New password"
                type="password"
                autoComplete="new-password"
              />
              <FormikInput
                name="confirmPassword"
                id="confirmPassword"
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
              />
              <Button
                type="submit"
                className="mt-1 w-full"
                disabled={isSubmitting || isLoading}
                variant="primary"
              >
                {isSubmitting || isLoading ? "Saving…" : "Update password"}
              </Button>
            </form>
          )}
        </Formik>
        <p className="text-center text-sm text-muted">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

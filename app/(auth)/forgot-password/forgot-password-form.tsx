"use client";

import { Formik } from "formik";
import Link from "next/link";
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
import { useForgotPasswordMutation } from "@/lib/api";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/forms/auth-schemas";

const initialValues: ForgotPasswordFormValues = {
  email: "",
};

export function ForgotPasswordForm() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  return (
    <Card className="shadow-(--shadow-sm)">
      <CardHeader className="space-y-2 border-0 pb-2">
        <CardTitle className="text-3xl font-normal">Forgot password</CardTitle>
        <CardDescription>
          Enter your account email. If it exists, we will send a reset link
          (when email is configured on the server).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-2">
        <Formik
          initialValues={initialValues}
          validationSchema={forgotPasswordSchema}
          validateOnBlur
          validateOnChange={false}
          onSubmit={async (values) => {
            try {
              await forgotPassword({
                email: values.email.trim().toLowerCase(),
              }).unwrap();
              toast.success(
                "If that email is registered, check your inbox for reset instructions.",
              );
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
              <Button
                type="submit"
                className="mt-1 w-full"
                disabled={isSubmitting || isLoading}
                variant="primary"
              >
                {isSubmitting || isLoading ? "Sending…" : "Send reset link"}
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

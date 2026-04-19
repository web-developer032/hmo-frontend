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
import { useUpdatePasswordMutation } from "@/lib/api";
import {
  updatePasswordSchema,
  type UpdatePasswordFormValues,
} from "@/lib/forms/auth-schemas";

const initialValues: UpdatePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ChangePasswordCard() {
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Your other sessions will be signed out after a successful change. If
          you forgot your password, use{" "}
          <Link href="/forgot-password" className="text-primary hover:underline">
            forgot password
          </Link>{" "}
          instead.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={initialValues}
          validationSchema={updatePasswordSchema}
          validateOnBlur
          validateOnChange={false}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            try {
              await updatePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              }).unwrap();
              resetForm();
              toast.success("Password updated. You stay signed in on this device.");
            } catch (e) {
              toast.error(getErrorMessage(e));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ handleSubmit, isSubmitting }) => (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormikInput
                name="currentPassword"
                id="currentPassword"
                label="Current password"
                type="password"
                autoComplete="current-password"
              />
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
                variant="primary"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? "Updating…" : "Update password"}
              </Button>
            </form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}

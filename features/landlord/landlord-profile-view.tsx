"use client";

import { Formik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import { FormikInput } from "@/components/formik/formik-input";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCreateLandlordProfileMutation,
  useGetLandlordProfileByUserIdQuery,
  useUpdateLandlordProfileMutation,
} from "@/lib/api/endpoints/landlord-profile.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import { ChangePasswordCard } from "@/features/auth/change-password-card";
import { useAppSelector } from "@/lib/hooks";

const schema = Yup.object({
  companyName: Yup.string(),
  contactName: Yup.string(),
  contactEmail: Yup.string().email("Enter a valid email"),
  contactPhone: Yup.string(),
  address: Yup.string(),
  city: Yup.string(),
  postcode: Yup.string(),
  website: Yup.string()
    .transform((v) => (typeof v === "string" && v.trim() === "" ? undefined : v))
    .optional()
    .url("Enter a valid URL"),
  bio: Yup.string(),
});

export function LandlordProfileView() {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id ?? "";
  const { data, isLoading, isError } = useGetLandlordProfileByUserIdQuery(
    userId,
    { skip: !userId }
  );
  const [createProfile] = useCreateLandlordProfileMutation();
  const [updateProfile] = useUpdateLandlordProfileMutation();
  const p = data?.data;

  if (isLoading) return <p className="text-sm text-muted">Loading...</p>;
  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Could not load landlord profile. Please try again.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Landlord profile"
        description="Keep your business and contact details up to date."
      />
      <Card>
        <CardHeader>
          <CardTitle>{p ? "Update profile" : "Create profile"}</CardTitle>
          <CardDescription>
            These details are used across landlord workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              companyName: p?.companyName ?? "",
              contactName: p?.contactName ?? "",
              contactEmail: p?.contactEmail ?? "",
              contactPhone: p?.contactPhone ?? "",
              address: p?.address ?? "",
              city: p?.city ?? "",
              postcode: p?.postcode ?? "",
              website: p?.website ?? "",
              bio: p?.bio ?? "",
            }}
            validationSchema={schema}
            enableReinitialize
            onSubmit={async (values, { setSubmitting }) => {
              if (!userId) {
                toast.error("User session missing.");
                setSubmitting(false);
                return;
              }
              try {
                const body = {
                  ...values,
                  companyName: values.companyName || undefined,
                  contactName: values.contactName || undefined,
                  contactEmail: values.contactEmail || undefined,
                  contactPhone: values.contactPhone || undefined,
                  address: values.address || undefined,
                  city: values.city || undefined,
                  postcode: values.postcode || undefined,
                  website: values.website || undefined,
                  bio: values.bio || undefined,
                };
                if (!p) {
                  await createProfile({ userId, ...body }).unwrap();
                  toast.success("Profile created");
                } else {
                  await updateProfile({ id: p.id, body }).unwrap();
                  toast.success("Profile updated");
                }
              } catch (e) {
                toast.error(getErrorMessage(e));
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {(f) => (
              <form onSubmit={f.handleSubmit} className="space-y-4">
                <FormikInput
                  name="companyName"
                  id="companyName"
                  label="Company name"
                />
                <FormikInput
                  name="contactName"
                  id="contactName"
                  label="Contact name"
                />
                <FormikInput
                  name="contactEmail"
                  id="contactEmail"
                  label="Contact email"
                />
                <FormikInput
                  name="contactPhone"
                  id="contactPhone"
                  label="Contact phone"
                />
                <FormikInput name="address" id="address" label="Address" />
                <FormikInput name="city" id="city" label="City" />
                <FormikInput name="postcode" id="postcode" label="Postcode" />
                <FormikInput name="website" id="website" label="Website" />
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={f.values.bio ?? ""}
                    onChange={f.handleChange}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={f.isSubmitting}
                >
                  {f.isSubmitting ? "Saving..." : "Save profile"}
                </Button>
              </form>
            )}
          </Formik>
        </CardContent>
      </Card>
      <ChangePasswordCard />
    </div>
  );
}

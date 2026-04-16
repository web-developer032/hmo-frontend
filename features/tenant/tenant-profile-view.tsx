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
import { getErrorMessage } from "@/lib/api/error-message";
import {
  useCreateTenantProfileMeMutation,
  useGetTenantProfileMeQuery,
  useUpdateTenantProfileMutation,
} from "@/lib/api/endpoints/tenant.endpoints";

const schema = Yup.object({
  fullName: Yup.string().required(),
  contactNumber: Yup.string().required(),
  address: Yup.string(),
  dateOfBirth: Yup.string(),
  idDocumentType: Yup.string(),
  idDocumentNumber: Yup.string(),
  idDocumentExpiry: Yup.string(),
  employerName: Yup.string(),
  jobTitle: Yup.string(),
  income: Yup.string().test(
    "nonneg",
    "Must be 0 or more",
    (v) => !v?.trim() || Number(v) >= 0
  ),
  guarantorName: Yup.string(),
  guarantorContact: Yup.string(),
});

export function TenantProfileView() {
  const { data, isLoading, isError } = useGetTenantProfileMeQuery();
  const [update] = useUpdateTenantProfileMutation();
  const [createProfile] = useCreateTenantProfileMeMutation();
  const p = data?.data;

  if (isLoading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }
  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Could not load your profile. Please try again.
      </p>
    );
  }
  if (!p) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <PageHeader
          title="My profile"
          description="Add the details landlords expect when you apply for a listing, including identity, work, and guarantor information."
        />
        <Card>
          <CardHeader>
            <CardTitle>Before you apply</CardTitle>
            <CardDescription>
              The docs position the tenant profile as the base for search and
              application workflows, so this profile captures the essentials
              landlords review first.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create your profile</CardTitle>
            <CardDescription>
              Required before submitting applications. Landlords review
              applications and manage contracts separately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{
                fullName: "",
                contactNumber: "",
                address: "",
                dateOfBirth: "",
                idDocumentType: "",
                idDocumentNumber: "",
                idDocumentExpiry: "",
                employerName: "",
                jobTitle: "",
                income: "",
                guarantorName: "",
                guarantorContact: "",
              }}
              validationSchema={schema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  console.log(values);
                  await createProfile({
                    ...values,
                    income: values.income?.trim()
                      ? Number(values.income)
                      : undefined,
                  }).unwrap();
                  toast.success("Profile created");
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
                    name="fullName"
                    id="fullName"
                    label="Full name"
                  />
                  <FormikInput
                    name="contactNumber"
                    id="contactNumber"
                    label="Contact number"
                  />
                  <FormikInput name="address" id="address" label="Address" />
                  <FormikInput
                    name="dateOfBirth"
                    id="dateOfBirth"
                    label="Date of birth"
                    type="date"
                  />
                  <FormikInput
                    name="idDocumentType"
                    id="idDocumentType"
                    label="ID document type"
                  />
                  <FormikInput
                    name="idDocumentNumber"
                    id="idDocumentNumber"
                    label="ID document number"
                  />
                  <FormikInput
                    name="idDocumentExpiry"
                    id="idDocumentExpiry"
                    label="ID document expiry"
                    type="date"
                  />
                  <FormikInput
                    name="employerName"
                    id="employerName"
                    label="Employer name"
                  />
                  <FormikInput
                    name="jobTitle"
                    id="jobTitle"
                    label="Job title"
                  />
                  <FormikInput
                    name="income"
                    id="income"
                    label="Income"
                    type="string"
                  />
                  <FormikInput
                    name="guarantorName"
                    id="guarantorName"
                    label="Guarantor name"
                  />
                  <FormikInput
                    name="guarantorContact"
                    id="guarantorContact"
                    label="Guarantor contact"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={f.isSubmitting}
                  >
                    {f.isSubmitting ? "Saving…" : "Save profile"}
                  </Button>
                </form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="My profile"
        description="Keep your application-ready details current so landlords can review your profile with less back-and-forth."
      />
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Profile ID: {p.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              fullName: p.fullName,
              contactNumber: p.contactNumber,
              address: p.address ?? "",
              dateOfBirth: p.dateOfBirth
                ? String(p.dateOfBirth).slice(0, 10)
                : "",
              idDocumentType: p.idDocumentType ?? "",
              idDocumentNumber: p.idDocumentNumber ?? "",
              idDocumentExpiry: p.idDocumentExpiry
                ? String(p.idDocumentExpiry).slice(0, 10)
                : "",
              employerName: p.employerName ?? "",
              jobTitle: p.jobTitle ?? "",
              income: p.income != null ? String(p.income) : "",
              guarantorName: p.guarantorName ?? "",
              guarantorContact: p.guarantorContact ?? "",
            }}
            validationSchema={schema}
            enableReinitialize
            onSubmit={async (values, { setSubmitting }) => {
              try {
                await update({
                  id: p.id,
                  body: {
                    ...values,
                    income: values.income?.trim()
                      ? Number(values.income)
                      : undefined,
                  },
                }).unwrap();
                toast.success("Saved");
              } catch (e) {
                toast.error(getErrorMessage(e));
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {(f) => (
              <form onSubmit={f.handleSubmit} className="space-y-4">
                <FormikInput name="fullName" id="fullName" label="Full name" />
                <FormikInput
                  name="contactNumber"
                  id="contactNumber"
                  label="Contact number"
                />
                <FormikInput name="address" id="address" label="Address" />
                <FormikInput
                  name="dateOfBirth"
                  id="dateOfBirth"
                  label="Date of birth"
                  type="date"
                />
                <FormikInput
                  name="idDocumentType"
                  id="idDocumentType"
                  label="ID document type"
                />
                <FormikInput
                  name="idDocumentNumber"
                  id="idDocumentNumber"
                  label="ID document number"
                />
                <FormikInput
                  name="idDocumentExpiry"
                  id="idDocumentExpiry"
                  label="ID document expiry"
                  type="date"
                />
                <FormikInput
                  name="employerName"
                  id="employerName"
                  label="Employer name"
                />
                <FormikInput name="jobTitle" id="jobTitle" label="Job title" />
                <FormikInput
                  name="income"
                  id="income"
                  label="Income"
                  type="string"
                />
                <FormikInput
                  name="guarantorName"
                  id="guarantorName"
                  label="Guarantor name"
                />
                <FormikInput
                  name="guarantorContact"
                  id="guarantorContact"
                  label="Guarantor contact"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={f.isSubmitting}
                >
                  {f.isSubmitting ? "Saving…" : "Save"}
                </Button>
              </form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}

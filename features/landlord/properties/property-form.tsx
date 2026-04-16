"use client";

import { Formik, type FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as Yup from "yup";
import { FormikInput } from "@/components/formik/formik-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
} from "@/lib/api/endpoints/property.endpoints";
import { getErrorMessage } from "@/lib/api/error-message";
import {
  isHmoPropertyType,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  RENT_FREQUENCIES,
} from "@/lib/forms/property-constants";
import type { Property } from "@/lib/types/entities";

const schema = Yup.object({
  address: Yup.string().required(),
  city: Yup.string().required(),
  postcode: Yup.string().required(),
  propertyType: Yup.string().required(),
  status: Yup.string(),
  hmoLicenseNumber: Yup.string(),
  epcRating: Yup.string(),
  numberOfRooms: Yup.number().min(0),
  displayName: Yup.string().max(255),
  headlineRentAmount: Yup.string().test(
    "nonneg",
    "Must be ≥ 0",
    (v) => !v?.trim() || Number(v) >= 0,
  ),
  headlineDepositAmount: Yup.string().test(
    "nonneg",
    "Must be ≥ 0",
    (v) => !v?.trim() || Number(v) >= 0,
  ),
  headlineRentFrequency: Yup.string().oneOf([...RENT_FREQUENCIES]),
  description: Yup.string().max(5000),
});

type Values = Yup.InferType<typeof schema>;

export function PropertyForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Property;
}) {
  const router = useRouter();
  const [createProperty, { isLoading: creating }] = useCreatePropertyMutation();
  const [updateProperty, { isLoading: updating }] = useUpdatePropertyMutation();

  const initialValues: Values = {
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    postcode: initial?.postcode ?? "",
    propertyType: (initial?.propertyType ?? PROPERTY_TYPES[0]) as string,
    status: (initial?.status ?? PROPERTY_STATUSES[0]) as string,
    hmoLicenseNumber: initial?.hmoLicenseNumber ?? "",
    epcRating: initial?.epcRating ?? "",
    numberOfRooms: initial?.numberOfRooms ?? 0,
    displayName: initial?.displayName ?? "",
    headlineRentAmount:
      initial?.headlineRentAmount != null
        ? String(initial.headlineRentAmount)
        : "",
    headlineDepositAmount:
      initial?.headlineDepositAmount != null
        ? String(initial.headlineDepositAmount)
        : "",
    headlineRentFrequency: (
      initial?.headlineRentFrequency &&
      RENT_FREQUENCIES.includes(
        initial.headlineRentFrequency as (typeof RENT_FREQUENCIES)[number],
      )
        ? initial.headlineRentFrequency
        : "Monthly"
    ) as (typeof RENT_FREQUENCIES)[number],
    description: initial?.description ?? "",
  };

  async function onSubmit(
    values: Values,
    { setSubmitting }: FormikHelpers<Values>,
  ) {
    const hmo = isHmoPropertyType(values.propertyType);
    const body: Record<string, unknown> = {
      address: values.address,
      city: values.city,
      postcode: values.postcode,
      propertyType: values.propertyType,
      status: values.status || undefined,
      hmoLicenseNumber: values.hmoLicenseNumber || undefined,
      epcRating: values.epcRating || undefined,
      displayName: values.displayName?.trim() || undefined,
      description: values.description?.trim() || undefined,
    };
    if (hmo) {
      body.numberOfRooms = values.numberOfRooms;
    } else {
      const hr = values.headlineRentAmount?.trim();
      const hd = values.headlineDepositAmount?.trim();
      if (hr) body.headlineRentAmount = Number(hr);
      if (hd) body.headlineDepositAmount = Number(hd);
      body.headlineRentFrequency = values.headlineRentFrequency;
    }
    try {
      if (mode === "create") {
        const res = await createProperty(body).unwrap();
        toast.success("Property created");
        router.push(`/landlord/properties/${res.data.id}`);
        router.refresh();
      } else if (initial) {
        await updateProperty({ id: initial.id, body }).unwrap();
        toast.success("Property updated");
        router.push(`/landlord/properties/${initial.id}`);
        router.refresh();
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "New property" : "Edit property"}</CardTitle>
        <CardDescription>
          HMO House uses a room grid; other types use headline rent and deposit
          for whole-property lets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          enableReinitialize
          onSubmit={onSubmit}
        >
          {(formik) => {
            const hmo = isHmoPropertyType(formik.values.propertyType);
            return (
            <form
              onSubmit={formik.handleSubmit}
              className="flex max-w-lg flex-col gap-4"
            >
              <FormikInput name="address" id="address" label="Address" />
              <FormikInput name="city" id="city" label="City" />
              <FormikInput name="postcode" id="postcode" label="Postcode" />
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property type</Label>
                <select
                  id="propertyType"
                  name="propertyType"
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={formik.values.propertyType}
                  onChange={formik.handleChange}
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                >
                  {PROPERTY_STATUSES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <FormikInput
                name="displayName"
                id="displayName"
                label="Display name (optional)"
                placeholder="Shown in lists instead of address"
              />
              <FormikInput
                name="hmoLicenseNumber"
                id="hmoLicenseNumber"
                label="HMO licence (optional)"
              />
              <FormikInput
                name="epcRating"
                id="epcRating"
                label="EPC rating (optional)"
              />
              {hmo ? (
                <FormikInput
                  name="numberOfRooms"
                  id="numberOfRooms"
                  label="Number of rooms (planning)"
                  type="number"
                />
              ) : (
                <>
                  <FormikInput
                    name="headlineRentAmount"
                    id="headlineRentAmount"
                    label="Headline rent £ (optional)"
                    type="number"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="headlineRentFrequency">Rent period</Label>
                    <select
                      id="headlineRentFrequency"
                      name="headlineRentFrequency"
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                      value={formik.values.headlineRentFrequency}
                      onChange={formik.handleChange}
                    >
                      {RENT_FREQUENCIES.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FormikInput
                    name="headlineDepositAmount"
                    id="headlineDepositAmount"
                    label="Headline deposit £ (optional)"
                    type="number"
                  />
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={formik.values.description ?? ""}
                  onChange={formik.handleChange}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={creating || updating || formik.isSubmitting}
              >
                {creating || updating || formik.isSubmitting
                  ? "Saving…"
                  : "Save"}
              </Button>
            </form>
            );
          }}
        </Formik>
      </CardContent>
    </Card>
  );
}

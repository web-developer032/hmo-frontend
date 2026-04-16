import { PropertyEditClient } from "@/features/landlord/properties/property-edit-client";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-2xl">
      <PropertyEditClient propertyId={id} />
    </div>
  );
}

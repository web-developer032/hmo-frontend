import { PropertyDetail } from "@/features/landlord/properties/property-detail";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-5xl">
      <PropertyDetail propertyId={id} />
    </div>
  );
}

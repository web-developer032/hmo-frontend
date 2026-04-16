import { PropertyForm } from "@/features/landlord/properties/property-form";

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PropertyForm mode="create" />
    </div>
  );
}

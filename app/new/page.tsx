import type { Metadata } from "next";
import { NewListingForm } from "@/components/NewListingForm";

export const metadata: Metadata = { title: "Vindeți sau dați în chirie cu REZULTAT" };

export default function NewListingPage() {
  return (
    <div className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <NewListingForm />
    </div>
  );
}

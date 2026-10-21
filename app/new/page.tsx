import type { Metadata } from "next";
import { NewListingForm } from "@/components/NewListingForm";

export const metadata: Metadata = { title: "Подать объявление — REZULTAT" };

export default function NewListingPage() {
  return (
    <div className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto mb-12 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Новое объявление</p>
        <h1 className="mt-3 font-serif text-5xl font-medium sm:text-7xl">
          Расскажите о <em className="text-accent">своём</em> объекте
        </h1>
      </div>
      <NewListingForm />
    </div>
  );
}

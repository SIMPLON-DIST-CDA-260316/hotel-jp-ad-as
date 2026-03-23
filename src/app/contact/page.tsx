import { db } from "@/db";
import { hotels } from "@/db/schema";
import ContactForm from "./contact-form";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ etablissement?: string }>;
}) {
  const params = await searchParams;
  const defaultHotelId = params.etablissement ? Number(params.etablissement) : undefined;

  const hotelList = await db.select({ id: hotels.id, name: hotels.name }).from(hotels);

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-2">Nous contacter</h1>
      <p className="text-gray-500 mb-8">
        Une question, une demande ? Remplissez le formulaire ci-dessous.
      </p>
      <ContactForm hotels={hotelList} defaultHotelId={defaultHotelId} />
    </main>
  );
}

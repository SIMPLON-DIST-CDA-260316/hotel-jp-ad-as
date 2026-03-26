import { db } from "@/db";
import { hotels, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { updateHotel } from "../../actions";
import HotelForm from "../../hotel-form";

export default async function EditHotelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const { id } = await params;

  const hotel = await db
    .select()
    .from(hotels)
    .where(eq(hotels.id, Number(id)))
    .limit(1)
    .then((rows) => rows[0]);

  if (!hotel) notFound();

  const managers = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.role, "manager"));

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Modifier l&apos;établissement
      </h1>
      <HotelForm action={updateHotel} managers={managers} hotel={hotel} submitLabel="Enregistrer" />
    </main>
  );
}

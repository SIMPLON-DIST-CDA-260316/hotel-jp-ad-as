import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHotel } from "../actions";
import HotelForm from "../hotel-form";

export default async function NewHotelPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const managers = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.role, "manager"));

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Nouvel établissement
      </h1>
      <HotelForm action={createHotel} managers={managers} submitLabel="Créer" />
    </main>
  );
}

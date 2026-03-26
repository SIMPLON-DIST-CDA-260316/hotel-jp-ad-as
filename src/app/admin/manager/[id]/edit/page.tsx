import { db } from "@/db";
import { hotels, users } from "@/db/schema";
import { and, eq, isNull, or, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { updateManager } from "../../actions";
import ManagerForm from "../../manager-form";

export default async function EditManagerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const { id } = await params;

  const manager = await db
    .select({
      id: users.id,
      firstname: users.firstname,
      lastname: users.lastname,
      email: users.email,
    })
    .from(users)
    .where(and(eq(users.id, id), eq(users.role, "manager")))
    .limit(1)
    .then((rows) => rows[0]);

  if (!manager) notFound();

  const currentHotel = await db
    .select({ id: hotels.id, name: hotels.name })
    .from(hotels)
    .where(eq(hotels.userId, id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  // Hôtels sans gérant (ou dont le gérant est le gérant courant)
  // LEFT JOIN conditionnel : ne rejoint que si userId pointe vers un manager différent
  const available = await db
    .select({ id: hotels.id, name: hotels.name })
    .from(hotels)
    .leftJoin(users, and(eq(hotels.userId, users.id), eq(users.role, "manager"), ne(hotels.userId, id)))
    .where(or(isNull(users.id), eq(hotels.userId, id)))
    .orderBy(hotels.name);

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Modifier le gérant</h1>
      <ManagerForm
        action={updateManager}
        hotels={available}
        manager={manager}
        currentHotelId={currentHotel?.id}
        submitLabel="Enregistrer"
      />
    </main>
  );
}

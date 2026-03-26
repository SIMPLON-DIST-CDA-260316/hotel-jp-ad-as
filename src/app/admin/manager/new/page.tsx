import { db } from "@/db";
import { hotels, users } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createManager } from "../actions";
import ManagerForm from "../manager-form";

export default async function NewManagerPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") redirect("/");

  // Hôtels sans gérant : LEFT JOIN sur users avec role='manager'
  // Si aucun gérant trouvé (users.id IS NULL), l'hôtel est disponible
  const available = await db
    .select({ id: hotels.id, name: hotels.name })
    .from(hotels)
    .leftJoin(users, and(eq(hotels.userId, users.id), eq(users.role, "manager")))
    .where(isNull(users.id))
    .orderBy(hotels.name);

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Nouveau gérant</h1>
      <ManagerForm action={createManager} hotels={available} submitLabel="Créer" />
    </main>
  );
}

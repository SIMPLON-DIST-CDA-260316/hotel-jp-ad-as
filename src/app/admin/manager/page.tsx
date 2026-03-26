import { db } from "@/db";
import { hotels, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteButton from "./delete-button";

export default async function AdminManagerPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const managers = await db
    .select({
      id: users.id,
      firstname: users.firstname,
      lastname: users.lastname,
      email: users.email,
      hotelName: hotels.name,
    })
    .from(users)
    .leftJoin(hotels, eq(hotels.userId, users.id))
    .where(eq(users.role, "manager"))
    .orderBy(users.lastname);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Gérants</h1>
        <Link
          href="/admin/manager/new"
          className="bg-icon text-white px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Ajouter
        </Link>
      </div>

      {managers.length === 0 ? (
        <p className="text-foreground/40 text-center py-24">
          Aucun gérant enregistré pour le moment.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-foreground/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-foreground/10 bg-foreground/3">
                <th className="text-left px-4 py-3 font-medium text-foreground/60">Prénom</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60 hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60 hidden md:table-cell">Établissement</th>
                <th className="text-right px-4 py-3 font-medium text-foreground/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((m) => (
                <tr key={m.id} className="border-b border-foreground/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{m.firstname}</td>
                  <td className="px-4 py-3 text-foreground/70">{m.lastname}</td>
                  <td className="px-4 py-3 text-foreground/70 hidden sm:table-cell">{m.email}</td>
                  <td className="px-4 py-3 text-foreground/70 hidden md:table-cell">
                    {m.hotelName ?? <span className="text-foreground/30">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/manager/${m.id}/edit`}
                        className="text-icon text-xs font-medium hover:underline"
                      >
                        Modifier
                      </Link>
                      <DeleteButton managerId={m.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

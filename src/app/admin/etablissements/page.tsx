import { db } from "@/db";
import { hotels, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteButton from "./delete-button";

export default async function AdminEtablissementsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const allHotels = await db
    .select({
      id: hotels.id,
      name: hotels.name,
      city: hotels.city,
      address: hotels.address,
      managerName: users.name,
    })
    .from(hotels)
    .leftJoin(users, eq(hotels.userId, users.id));

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Établissements</h1>
        <Link
          href="/admin/etablissements/new"
          className="bg-icon text-white px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Ajouter
        </Link>
      </div>

      {allHotels.length === 0 ? (
        <p className="text-foreground/40 text-center py-24">
          Aucun établissement pour le moment.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-foreground/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-foreground/10 bg-foreground/3">
                <th className="text-left px-4 py-3 font-medium text-foreground/60">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">Ville</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60 hidden md:table-cell">Adresse</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60 hidden sm:table-cell">Gérant</th>
                <th className="text-right px-4 py-3 font-medium text-foreground/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allHotels.map((hotel) => (
                <tr key={hotel.id} className="border-b border-foreground/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{hotel.name}</td>
                  <td className="px-4 py-3 text-foreground/70">{hotel.city}</td>
                  <td className="px-4 py-3 text-foreground/70 hidden md:table-cell">{hotel.address}</td>
                  <td className="px-4 py-3 text-foreground/70 hidden sm:table-cell">
                    {hotel.managerName ?? <span className="text-foreground/30">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/etablissements/${hotel.id}/edit`}
                        className="text-icon text-xs font-medium hover:underline"
                      >
                        Modifier
                      </Link>
                      <DeleteButton hotelId={hotel.id} />
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

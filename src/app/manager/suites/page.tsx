import { db } from "@/db";
import { images, suites } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { requireManager } from "./actions";
import DeleteButton from "./delete-button";

export default async function ManagerSuitesPage() {
  const { hotel } = await requireManager();

  if (!hotel) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-4">Mes suites</h1>
        <p className="text-foreground/40 text-center py-24">
          Aucun établissement assigné.
        </p>
      </main>
    );
  }

  const allSuites = await db
    .select({ id: suites.id, title: suites.title, price: suites.price })
    .from(suites)
    .where(eq(suites.hotelId, hotel.id));

  const hotelSuites = await Promise.all(
    allSuites.map(async (suite) => {
      const img = await db
        .select({ link: images.link })
        .from(images)
        .where(eq(images.suiteId, suite.id))
        .limit(1)
        .then((rows) => rows[0]);
      return { ...suite, imageLink: img?.link ?? null };
    }),
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-icon font-semibold text-xs uppercase tracking-widest mb-1">
            {hotel.name}
          </p>
          <h1 className="text-3xl font-bold text-foreground">Mes suites</h1>
        </div>
        <Link
          href="/manager/suites/new"
          className="bg-icon text-white px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Ajouter
        </Link>
      </div>

      {hotelSuites.length === 0 ? (
        <p className="text-foreground/40 text-center py-24">
          Aucune suite pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotelSuites.map((suite) => (
            <div
              key={suite.id}
              className="rounded-xl border border-foreground/10 overflow-hidden"
            >
              <div className="relative h-48 bg-foreground/5">
                {suite.imageLink ? (
                  <Image
                    src={suite.imageLink}
                    alt={suite.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-foreground/30 text-sm">
                    Aucune image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1">
                  {suite.title}
                </h3>
                <p className="text-icon font-medium text-sm mb-3">
                  {Number(suite.price).toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}{" "}
                  / nuit
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/manager/suites/${suite.id}/edit`}
                    className="text-icon text-xs font-medium hover:underline"
                  >
                    Modifier
                  </Link>
                  <DeleteButton suiteId={suite.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

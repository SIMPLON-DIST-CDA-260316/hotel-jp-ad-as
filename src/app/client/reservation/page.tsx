import { auth } from "@/lib/auth";
import { db } from "@/db";
import { reservations, suites, hotels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CancelButton from "@/components/cancelButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientReservationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const userReservations = await db
    .select({
      id: reservations.id,
      dateBegin: reservations.dateBegin,
      dateEnd: reservations.dateEnd,
      status: reservations.status,
      suiteTitle: suites.title,
      suitePrice: suites.price,
      hotelName: hotels.name,
      hotelCity: hotels.city,
    })
    .from(reservations)
    .innerJoin(suites, eq(reservations.suiteId, suites.id))
    .innerJoin(hotels, eq(suites.hotelId, hotels.id))
    .where(eq(reservations.userId, session.user.id))
    .orderBy(reservations.dateBegin);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = userReservations.filter((r) => r.dateBegin >= today);
  const past = userReservations.filter((r) => r.dateBegin < today).reverse();

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* ── En-tête ─────────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="text-icon font-semibold text-xs uppercase tracking-widest mb-2">
          Espace client
        </p>
        <h1 className="text-4xl font-bold text-foreground">
          Mes réservations
        </h1>
        {userReservations.length > 0 && (
          <p className="text-foreground/50 mt-2 text-sm">
            Bonjour {session.user.firstname} —{" "}
            {userReservations.length} réservation
            {userReservations.length > 1 ? "s" : ""} au total
          </p>
        )}
      </div>

      {/* ── Empty state ─────────────────────────────────────────────── */}
      {userReservations.length === 0 && (
        <div className="text-center py-24">
          <p className="text-foreground/40 text-lg mb-6">
            Vous n&apos;avez aucune réservation pour le moment.
          </p>
          <Link
            href="/etablissements"
            className="inline-block bg-icon text-white font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Découvrir nos établissements
          </Link>
        </div>
      )}

      {/* ── Réservations à venir ─────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            À venir
          </h2>
          <div className="flex flex-col gap-4">
            {upcoming.map((r) => (
              <ReservationCard key={r.id} reservation={r} />
            ))}
          </div>
        </section>
      )}

      {/* ── Réservations passées ─────────────────────────────────────── */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Passées
          </h2>
          <div className="flex flex-col gap-4">
            {past.map((r) => (
              <ReservationCard key={r.id} reservation={r} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

type Reservation = {
  id: number;
  dateBegin: string;
  dateEnd: string;
  status: string;
  suiteTitle: string;
  suitePrice: string;
  hotelName: string;
  hotelCity: string;
};

function ReservationCard({ reservation: r }: { reservation: Reservation }) {
  const dateBegin = new Date(r.dateBegin + "T12:00:00");
  const dateEnd = new Date(r.dateEnd + "T12:00:00");

  const formatDate = (d: Date) =>
    d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const pricePerNight = Number(r.suitePrice);

  const priceFormatted = pricePerNight.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  const nights = Math.round(
    (dateEnd.getTime() - dateBegin.getTime()) / (1000 * 60 * 60 * 24)
  );

  const totalFormatted = (pricePerNight * nights).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + 3);
  const limitDateString = limitDate.toISOString().split("T")[0];

  return (
    <div className="rounded-2xl border border-foreground/10 p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-shadow">
      {/* Infos principale */}
      <div className="flex-1">
        <p className="text-icon font-semibold text-xs uppercase tracking-widest mb-1">
          {r.hotelName} &middot; {r.hotelCity}
        </p>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {r.suiteTitle}
        </h3>
        <p className="text-foreground/60 text-sm">
          {formatDate(dateBegin)} → {formatDate(dateEnd)}
          <span className="ml-2 text-foreground/40">
            ({nights} nuit{nights > 1 ? "s" : ""})
          </span>
        </p>
      </div>

      {/* Prix + badge */}
      <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
        <div className="text-right">
          <p className="text-foreground font-semibold">
            {totalFormatted}
          </p>
          <p className="text-foreground/40 text-xs">
            {priceFormatted} / nuit
          </p>
        </div>
        <StatusBadge status={r.status} />

        {/* bouton d'annulation */}
        {r.status === "confirmed" && (
          <CancelButton
          reservationId={r.id}
          possibleToCancel={r.dateBegin > limitDateString}
          />
        )}
        
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed") {
    return (
      <span className="bg-green-100 text-green-800 rounded-full px-3 py-0.5 text-xs font-medium">
        Confirmée
      </span>
    );
  }
  return (
    <span className="bg-red-100 text-red-700 rounded-full px-3 py-0.5 text-xs font-medium">
      Annulée
    </span>
  );
}

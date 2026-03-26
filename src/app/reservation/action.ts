// "use server" est obligatoire pour dire à Next.js que ce fichier
// contient des fonctions qui s'exécutent côté serveur uniquement
// Ces fonctions peuvent faire des requêtes BDD, vérifier des données, etc.
"use server";

// Import de la base de données
import { db } from "@/db";

// Import de la table Reservations depuis Drizzle
import { reservations, suites } from "@/db/schema";

// and est une fonction Drizzle pour combiner plusieurs conditions (WHERE ... AND ...)
// eq est une fonction Drizzle pour faire des comparaisons (WHERE id = ...)
// lt est une fonction Drizzle pour "inférieur à" (WHERE date < ...)
// gt est une fonction Drizzle pour "supérieur à" (WHERE date > ...)
import { and, eq, lt, gt } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// On définit le type des paramètres que la fonction reçoit
type CheckAvailabilityParams = {
    suiteId: number;
    dateBegin: string;
    dateEnd: string;
};

// Fonction principale qui vérifie la disponibilité
export async function checkAvailability(params: CheckAvailabilityParams) {

    // Récupération des paramètres
    const suiteId = params.suiteId;
    const dateBegin = params.dateBegin;
    const dateEnd = params.dateEnd;

    // Recherche dans la BDD s'il existe déjà une réservation qui chevauchent les dates demandées
    const existingReservation = await db
        .select()
        .from(reservations)
        .where(
            and(
                // On vérifie que c'est bien la suite demandée
                eq(reservations.suiteId, suiteId),
                // On vérifie que la réservation est confirmée (pas annulée)
                eq(reservations.status, "confirmed"),
                // Vérification du chevauchement de dates
                // La réservation existante commence AVANT la fin demandée
                lt(reservations.dateBegin, dateEnd),
                // La réservation existante finit APRÈS le début demandé
                gt(reservations.dateEnd, dateBegin),
            )
        )
        .limit(1)
        .then((rows) => rows[0]);

    // Si une réservation existante a été trouvée → indisponible
    // Si aucune réservation trouvée → disponible
    if (existingReservation) {
        return "Indisponible"
    }

    return "Disponible"
}

export async function getSuitesByHotel(hotelId: number) {
  return db
    .select({
      id: suites.id,
      title: suites.title,
      price: suites.price,
    })
    .from(suites)
    .where(eq(suites.hotelId, hotelId));
}

export async function createReservation(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { error: "Vous devez être connecté pour réserver." };
  }

  const suiteId = Number(formData.get("suiteId"));
  const dateBegin = formData.get("dateBegin")?.toString();
  const dateEnd = formData.get("dateEnd")?.toString();

  if (!suiteId || !dateBegin || !dateEnd) {
    return { error: "Tous les champs sont obligatoires." };
  }

  if (dateEnd <= dateBegin) {
    return { error: "La date de fin doit être après la date de début." };
  }

  const today = new Date().toISOString().split("T")[0];
  if (dateBegin < today) {
    return { error: "La date de début ne peut pas être dans le passé." };
  }

  const availability = await checkAvailability({ suiteId, dateBegin, dateEnd });
  if (availability === "Indisponible") {
    return { error: "Cette suite n'est pas disponible pour les dates sélectionnées." };
  }

  await db.insert(reservations).values({
    dateBegin,
    dateEnd,
    userId: session.user.id,
    suiteId,
  });

  return { success: true };
}
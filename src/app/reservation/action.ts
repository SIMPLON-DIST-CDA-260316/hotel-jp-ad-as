// "use server" est obligatoire pour dire à Next.js que ce fichier
// contient des fonctions qui s'exécutent côté serveur uniquement
// Ces fonctions peuvent faire des requêtes BDD, vérifier des données, etc.
"use server";

// Import de la base de données
import { db } from "@/db";

// Import de la table Reservations depuis Drizzle
import { reservations, suites } from "@/db/schema";

// revalidatePath permet de dire à Next.js de rafraîchir la page
// après une modification en BDD, sans recharger toute l'application
import { revalidatePath } from "next/cache";

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

type CancelReservationParams = {
  reservationId: number;
}

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

// Fonction qui annule une réservation
export async function cancelReservation(params: CancelReservationParams) {

  // On récupère l'id de la réservation depuis les paramètres
  const reservationId = params.reservationId;

  // On récupère la session de l'utilisateur connecté
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Si l'utilisateur n'est pas connecté, on retourne une erreur
  if (!session?.user) {
    return { error: "Vous devez être connecté pour annuler la réservation." };
  }

  // Récupération de la réservation depuis la BDD grâce à son id
  const reservation = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, reservationId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!reservation) {
    return { error: "Réservation introuvable" };
  }

  // Vérification que la réservation appartient bien à l'utilisateur connecté
  // session.user.id → l'id de l'utilisateur connecté
  // reservation.userId → l'id de l'utilisateur qui a fait la réservation
  // Si ce n'est pas la même personne → on retourne une erreur
  if (reservation.userId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à annuler cette réservation !" };
  }

  // Vérification: la réservation déjà annulée ?
  if (reservation.status === "cancelled") {
    return { error: "Cette réservation a déjà été annulée" };
  }

  // Vérification des 3 jours avant annulation
  const today = new Date();

  // On calcule la date limite = aujourd'hui + 3 jours
  // setDate() modifie le jour du mois
  // getDate() récupère le jour du mois actuel
  const limitDate = new Date(today);
  limitDate.setDate(today.getDate() + 3);

  // On convertit la date limite en string format "YYYY-MM-DD"
  // pour pouvoir la comparer avec dateBegin qui est aussi une string
  const limitDateString = limitDate.toISOString().split("T")[0];

  // Si dateBegin <= aujourd'hui + 3 jours → annulation impossible
  if (reservation.dateBegin <= limitDateString) {
    return { error: "Annulation impossible à 3 jours de la réservation." };
  }

  // Toutes les vérifications sont passées, on peut annuler la réservation
  // Update le statut à "cancelled" dans la BDD

  await db
    .update(reservations)
    .set({ status: "cancelled" })
    .where(eq(reservations.id, reservationId));

  // revalidatePath dit à Next.js de rafraîchir la page "Mes réservations"
  revalidatePath("/client/reservation");

  return { success: true };
}
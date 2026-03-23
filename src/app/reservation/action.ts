// "use server" est obligatoire pour dire à Next.js que ce fichier
// contient des fonctions qui s'exécutent côté serveur uniquement
// Ces fonctions peuvent faire des requêtes BDD, vérifier des données, etc.
"use server";

// Import de la base de données
import { db } from "@/db";

// Import de la table Reservations depuis Drizzle
import { reservations } from "@/db/schema";

// and est une fonction Drizzle pour combiner plusieurs conditions (WHERE ... AND ...)
// eq est une fonction Drizzle pour faire des comparaisons (WHERE id = ...)
// lt est une fonction Drizzle pour "inférieur à" (WHERE date < ...)
// gt est une fonction Drizzle pour "supérieur à" (WHERE date > ...)
import { and, eq, lt, gt } from "drizzle-orm";

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
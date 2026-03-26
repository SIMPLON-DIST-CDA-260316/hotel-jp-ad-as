// "use client" obligatoire car on a des useState et des onClick
"use client";

// useState pour gérer l'état de la confirmation
import { useState } from "react";

// import du server action
import { cancelReservation } from "@/app/reservation/action";

// On définit le type des props que le composant reçoit
type Props = {
    reservationId: number;
    possibleToCancel: boolean;
};

export default function CancelButton({ reservationId, possibleToCancel }: Props) {
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [error, setError] = useState<string>("");



    // Fonction appelée quand l'utilisateur confirme l'annulation
    // async car elle appelle la server action cancelReservation
    async function handleCancel(): Promise<void> {

        setError("");

        // On appelle la server action cancelReservation
        // Elle retourne soit { success: true } soit { error: "..." }
        const result = await cancelReservation({ reservationId });

        // Si la server action retourne une erreur, on l'affiche
        if (result.error) {
            setError(result.error);
            return;
        }

        // Si tout s'est bien passé, on cache la confirmation
        setShowConfirm(false);
    }

    // Si annulation impossible
    if (!possibleToCancel) {
        return (
            <p className="text-red-500 text-base">
                Annulation impossible moins de 3 jours avant le séjour !
            </p>
        );
    }

    // S'affiche seulement si possibleToCancel est true
    return (
        <div className="flex flex-col items-end gap-2">

            {/* Affiche le message d'erreur si la server action retourne une erreur */}
            {error !== "" && (
                <p className="text-red-500 text-xs">{error}</p>
            )}

            {/* Si showConfirm est false → bouton "Annuler" */}
            {!showConfirm ? (
                <button
                    onClick={() => setShowConfirm(true)}
                    className="text-red-500 text-xs hover:underline"
                >
                    Annuler la réservation
                </button>
            ) : (
                // Si showConfirm est true → affiche la confirmation
                <div className="flex items-center gap-2">
                    <p className="text-foreground/60 text-xs">Êtes-vous sûr ?</p>

                    {/* Bouton "Oui" → appelle handleCancel */}
                    <button
                        onClick={handleCancel}
                        className="text-red-500 text-xs font-semibold hover:underline"
                    >
                        Oui
                    </button>

                    {/* Bouton "Non" → cache la confirmation */}
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="text-foreground/60 text-xs hover:underline"
                    >
                        Non
                    </button>
                </div>
            )}

        </div>
    );

}


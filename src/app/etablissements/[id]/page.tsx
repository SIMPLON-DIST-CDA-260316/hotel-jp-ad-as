// etablissements/[id]/page.tsx

// On importe la connexion à la base de données
import { db } from "@/db";

// On importe les tables dont on a besoin depuis le schéma Drizzle
import { hotels, suites, images } from "@/db/schema";

// eq est une fonction Drizzle pour faire des comparaisons (WHERE id = ...)
import { eq } from "drizzle-orm";

import Breadcrumb from "@/components/breadcrumb";
import Link from "next/link";

// Les props de cette page contiennent les paramètres de l'URL
// params.id correspond au [id] dans le nom du dossier
type Props = {
    params: Promise<{ id: string }>;
};

export default async function EtablissementPage(props: Props) {

    // On récupère les paramètres de l'URL
    // await car params est une Promise dans Next.js 16
    const params = await props.params;

    // On récupère l'id depuis les paramètres
    // C'est une string car tout ce qui vient de l'URL est du texte
    const id = params.id;

    // On récupère l'hôtel depuis la BDD grâce à son id, avec Drizzle (= SELECT * FROM hotel WHERE id = 3 LIMIT 1; en requête SQL)
    // eq(hotels.id, Number(id)) = WHERE hotel.id = id
    // Number(id) car l'id dans l'URL est une string, on le convertit en nombre
    const hotel = await db
        .select()
        .from(hotels)
        .where(eq(hotels.id, Number(id)))
        .limit(1)
        .then((rows) => rows[0]);

    // Si l'hôtel n'existe pas en BDD, on affiche un message sur la page
    if (!hotel) {
        return (
            <main className="max-w-5xl mx-auto px-4 py-10">
                <p className="text-foreground/60">Nous n'avons pas trouvé cet hôtel.</p>
            </main>
        );
    }

    // On récupère toutes les suites de cet hôtel
    // suites.hotelId → la colonne hotel_id dans la table suite
    // hotel.id → l'id de l'hôtel qu'on a récupéré juste avant
    const hotelSuites = await db
        .select()
        .from(suites)
        .where(eq(suites.hotelId, hotel.id));

    // Pour chaque suite, on récupère sa première image
    // On crée un objet vide qui contiendra les images indexées par suiteId
    // Record<number, ...> veut dire : un objet dont les clés sont des nombres
    const suiteImages: Record<number, typeof images.$inferSelect> = {};
    //    ↑            ↑                                            ↑
    //    nom          type : objet dont                            valeur initiale
    //    de la        les clés sont des nombres                    = objet vide
    //    variable     et les valeurs sont des images

    // On boucle sur chaque suite pour récupérer son image
    for (const suite of hotelSuites) {
        // On récupère la première image de la suite
        const image = await db
            .select()
            .from(images)
            .where(eq(images.suiteId, suite.id))
            .limit(1)
            .then((rows) => rows[0]);
        // Si une image existe, on la stocke dans notre objet
        // suiteImages[suite.id] = image signifie : "pour la suite n°X, l'image est Y"
        if (image) {
            suiteImages[suite.id] = image;
        }
    }

    return (
        <main className="max-w-5xl mx-auto px-4 py-10">

            {/* Breadcrumb : Accueil > Établissements > Nom de l'hôtel */}
            <Breadcrumb
                items={[
                    { label: "Accueil", href: "/" },
                    { label: "Établissements", href: "/etablissements" },
                    { label: hotel.name, href: `/etablissements/${hotel.id}` },
                ]}
            />

            {/* Infos de l'hôtel */}
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                <p className="text-foreground/60 mb-1">{hotel.city} — {hotel.address}</p>
                {/* On affiche la description seulement si elle existe */}
                {hotel.description && (
                    <p className="mt-4 text-foreground/80">{hotel.description}</p>
                )}


                {/* Lien de contact */}
                <Link
                    href={`/contact?etablissement=${hotel.id}`}
                    className="inline-block mb-10 mt-4 text-icon hover:underline"
                >
                    Contacter cet établissement
                </Link>

            </div>

            {/* Section des suites */}
            <h2 className="text-2xl font-semibold mb-6">Les suites disponibles</h2>

            {/* Si aucune suite n'existe, on affiche un message */}
            {hotelSuites.length === 0 ? (
                <p className="text-foreground/60">Aucune suite disponible pour le moment.</p>
            ) : (
                // Sinon on affiche la grille de cards
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotelSuites.map((suite) => (
                        // Chaque card est un lien vers la page détail de la suite
                        <Link
                            key={suite.id}
                            href={`/etablissements/${hotel.id}/suites/${suite.id}`}
                            className="border border-foreground/10 rounded-lg overflow-hidden hover:border-icon transition-colors"
                        >
                            {/* Image de la suite si elle existe */}
                            {suiteImages[suite.id] ? (
                                <img
                                    src={suiteImages[suite.id].link}
                                    alt={suiteImages[suite.id].description}
                                    className="w-full h-48 object-cover"
                                />
                            ) : (
                                <div className="w-full h-48 bg-foreground/5 flex items-center justify-center">
                                    <span className="text-foreground/30">Pas d'image</span>
                                </div>
                            )}

                            {/* Infos de la suite */}
                            <div className="p-4">
                                <h3 className="font-semibold mb-1">{suite.title}</h3>
                                <p className="text-icon font-bold">{suite.price} €</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

        </main>
    );
}
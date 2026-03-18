// Pas de Use Client ici car pas de useState, de useEffect, de onClick, etc... bref pas besoin quand c'est juste un contenu statique

// Link est le composant Next.js pour la navigation interne, plus performant que la balise <a> classique
import Link from "next/link";

// On exporte une fonction qui retourne du HTML
export default function Footer() {
    return (
        <footer className="border-t border-foreground/10 py-8 mt-auto">
            <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4">

                {/* Nom du groupe */}
                <p className="text-icon font-semibold text-lg">
                    Hôtels JP-AD-AS
                </p>

                {/* Liens de navigation */}
                <nav className="flex gap-6">
                    <Link
                        href="/etablissements"
                        className="text-foreground/70 hover:text-icon transition-colors"
                    >
                        Établissements
                    </Link>
                    <Link
                        href="/contact"
                        className="text-foreground/70 hover:text-icon transition-colors"
                    >
                        Contact
                    </Link>
                </nav>

                {/* Copyright */}
                <p className="text-foreground/50 text-sm">
                    © 2026  JP-AD-AS. Tous droits réservés.
                </p>

            </div>
        </footer>
    )
}
// Intéraction avec la page donc :
"use client";

// useState permet de gérer l'état des champs du formulaire et des erreurs
import { useState } from "react";

// useRouter permet de rediriger l'utilisateur après connexion
import { useRouter } from "next/navigation";

// Importation de signIn directement depuis la config Better Auth
import { signIn } from "@/lib/auth-client";

// Link est le composant Next.js pour la navigation interne
import Link from "next/link";

// "use client" étant déjà en haut, pas besoin de async ici
export default function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // initialisation du router pour redirection après la connexion
    const router = useRouter();

    async function handleSubmit() {
        // Remet l'erreur à vide
        setError("");

        // Appel de Better Auth pour se connecter
        const result = await signIn.email({
            email: email,
            password: password,
        });

        if (result.error) {
            // affichage du message d'erreur
            setError("Email ou mot de passe incorrect");
            return;
        }
        // Redirige vers la page d'accueil
        router.push("/");

        // router.refresh() force Next.js à rafraîchir les données de la page pour la navbar
        router.refresh();
    }

    return (
        <main className="max-w-md mx-auto px-4 py-20">

            {/* Titre de la page */}
            <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
                Connexion
            </h1>

            {error !== "" && (
                <p className="text-red-500 mb-4 text-center text-sm">{error}</p>
            )}

            {/* form permet la soumission avec la touche Entrée */}
            {/* onSubmit → appelle handleSubmit quand l'utilisateur appuie sur Entrée ou clique sur le bouton */}
            {/* e.preventDefault() → empêche le rechargement de la page par défaut du navigateur */}
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>

                <div className="mb-4">
                    <label className="block mb-1 font-medium text-foreground">
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-foreground/20 rounded px-3 py-2 text-foreground focus:outline-none focus:border-icon transition-colors"
                        placeholder="exemple@mail.com"
                    />
                </div>

                {/* Champ mot de passe */}
                <div className="mb-6">
                    <label className="block mb-1 font-medium text-foreground">
                        Mot de passe
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-foreground/20 rounded px-3 py-2 text-foreground focus:outline-none focus:border-icon transition-colors"
                        placeholder="Votre mot de passe"
                    />
                </div>

                {/* Bouton de connexion */}
                {/* onClick → appelle handleSubmit quand l'utilisateur clique */}
                <button
                    type="submit"
                    className="w-full bg-foreground text-background py-2 rounded font-medium hover:opacity-90 transition-opacity"
                >
                    Se connecter
                </button>

            </form>

            {/* Lien vers la page d'inscription */}
            <p className="text-center mt-4 text-foreground/60">
                Pas encore de compte ?{" "}
                <Link href="/register" className="text-icon hover:underline">
                    S'inscrire
                </Link>
            </p>

        </main>
    );
}
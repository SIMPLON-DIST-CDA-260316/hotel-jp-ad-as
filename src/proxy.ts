// NextResponse permet de créer des réponses : redirections, etc.
import { NextResponse } from "next/server";

// NextRequest représente la requête entrante (l'URL, les cookies, etc.)
import type { NextRequest } from "next/server";

// auth nous permettra de récupérer la session de l'utilisateur connecté
import { auth } from "@/lib/auth";

// headers() permet de lire les en-têtes de la requête
// Better Auth en a besoin pour lire le cookie de session et savoir qui est connecté
import { headers } from "next/headers";

export async function proxy(request: NextRequest) {
    // On récupère le chemin de l'URL
    // ex: si l'URL est http://localhost:3000/admin/etablissements
    // alors pathname = "/admin/etablissements"
    const pathname = request.nextUrl.pathname;

    // On récupère la session de l'utilisateur connecté via Better Auth
    // headers() donne à Better Auth accès aux en-têtes de la requête
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // On définit les routes publiques
    const publicRoutes = ["/", "/etablissements", "/contact", "/login", "/register"]

    // On vérifie si la route actuelle est publique
    // .some() parcourt le tableau et retourne true si au moins un élément correspond
    // startsWith() vérifie si le pathname commence par cette route
    const isPublicRoutes = publicRoutes.some((route) => pathname.startsWith(route));

    // Si c'est une route publique, on laisse passer sans vérification
    // NextResponse.next() signifie "continue normalement, affiche la page"
    if (isPublicRoutes) {
        return NextResponse.next();
    }

    // Si la session est null, l'utilisateur n'est pas connecté
    // On vérifie si la route nécessite une connexion
    if (!session) {

        // Si l'utilisateur essaie d'accéder à une zone protégée sans être connecté
        // on le redirige vers /login
        if (
            pathname.startsWith("/client") ||
            pathname.startsWith("/manager") ||
            pathname.startsWith("/admin")
        ) {
            // NextResponse.redirect() → redirige l'utilisateur vers une autre page
            // new URL("/login", request.url) → construit l'URL complète de la page de redirection
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Si ce n'est pas une zone protégée, on laisse passer
        return NextResponse.next();

    }

    // Si l'utilisateur est connecté, on vérifie son rôle
    // On récupère le rôle depuis la session
    const role = session.user.role;

    // Protection de la zone gérant /manager/*
    // Seuls les utilisateurs avec le rôle "manager" peuvent y accéder
    if (pathname.startsWith("/manager") && role !== "manager") {
        // Si l'utilisateur n'est pas manager, on le redirige vers "/"
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Protection de la zone admin /admin/*
    // Seuls les utilisateurs avec le rôle "admin" peuvent y accéder
    if (pathname.startsWith("/admin") && role !== "admin") {
        // Si l'utilisateur n'est pas admin, on le redirige vers "/"
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Si toutes les vérifications sont passées, on laisse accéder à la page
    return NextResponse.next();

}

// Ce bloc est obligatoire dans Next.js pour dire au proxy sur quelles routes il doit s'activer
// Sans ce bloc, le proxy s'activerait sur TOUTES les routes, même les fichiers statiques
export const config = {
    matcher: [
        // Le proxy s'active sur toutes les routes SAUF :
        // - _next/static : les fichiers CSS, JS générés par Next.js
        // - _next/image : les images optimisées par Next.js
        // - favicon.ico : l'icône du site
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
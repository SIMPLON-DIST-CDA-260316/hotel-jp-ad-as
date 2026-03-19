import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-var(--footer-height,169px))] flex flex-col items-center justify-center px-4 py-24 text-center">
      {/* Code 404 stylisé */}
      <p className="text-8xl font-bold text-icon opacity-50 select-none leading-none">
        404
      </p>

      {/* Titre */}
      <h1 className="mt-4 text-3xl font-semibold text-foreground">
        Page introuvable
      </h1>

      {/* Sous-texte */}
      <p className="mt-3 text-foreground/70 max-w-sm">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>

      {/* Séparateur doré */}
      <div className="mt-8 w-12 h-px bg-icon" />

      {/* Bouton retour accueil */}
      <Link
        href="/"
        className="mt-8 inline-block px-8 py-3 rounded-full border border-icon text-icon font-medium hover:bg-icon hover:text-white transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}

import Breadcrumb from "@/components/breadcrumb";
import { db } from "@/db";
import { hotels, images, suites } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SuitePage({
  params,
}: {
  params: Promise<{ id: string; suiteId: string }>;
}) {
  const { id, suiteId } = await params;

  const hotel = await db
    .select()
    .from(hotels)
    .where(eq(hotels.id, Number(id)))
    .limit(1)
    .then((rows) => rows[0]);

  const suite = await db
    .select()
    .from(suites)
    .where(eq(suites.id, Number(suiteId)))
    .limit(1)
    .then((rows) => rows[0]);

  // Suite inexistante ou n'appartenant pas à cet hôtel
  if (!suite || !hotel || suite.hotelId !== hotel.id) {
    notFound();
  }

  const suiteImages = await db
    .select()
    .from(images)
    .where(eq(images.suiteId, Number(suiteId)));

  const [heroImage, ...extraImages] = suiteImages;

  const priceFormatted = Number(suite.price).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  return (
    <>
      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Établissements", href: "/etablissements" },
            { label: hotel.name, href: `/etablissements/${hotel.id}` },
            {
              label: suite.title,
              href: `/etablissements/${hotel.id}/suites/${suite.id}`,
            },
          ]}
        />
      </div>

      {/* ── Galerie hero ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 mb-12">
        {suiteImages.length === 0 ? (
          <div className="h-120 rounded-2xl bg-foreground/5 flex items-center justify-center">
            <span className="text-foreground/30 text-lg">
              Aucune photo disponible
            </span>
          </div>
        ) : suiteImages.length === 1 ? (
          <div className="relative h-120 rounded-2xl overflow-hidden">
            <Image
              src={heroImage.link}
              alt={heroImage.description ?? suite.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <>
            {/* ── Mobile : hero + grille secondaire empilés ── */}
            <div className="md:hidden flex flex-col gap-2">
              <div className="relative h-72 rounded-2xl overflow-hidden">
                <Image
                  src={heroImage.link}
                  alt={heroImage.description ?? suite.title}
                  fill
                  className="object-cover"
                />
              </div>

              {extraImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {extraImages.slice(0, 2).map((img, i) => (
                    <div
                      key={img.id}
                      className="relative h-40 rounded-xl overflow-hidden"
                    >
                      <Image
                        src={img.link}
                        alt={img.description ?? `${suite.title} — photo ${i + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Desktop : grid 3 colonnes × 2 rangées ── */}
            <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-3 h-120 rounded-2xl overflow-hidden">
              {/* Image principale : 2 colonnes × 2 rangées */}
              <div className="relative col-span-2 row-span-2 overflow-hidden">
                <Image
                  src={heroImage.link}
                  alt={heroImage.description ?? suite.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Images secondaires */}
              {extraImages.slice(0, 2).map((img, i) => (
                <div key={img.id} className="relative overflow-hidden">
                  <Image
                    src={img.link}
                    alt={img.description ?? `${suite.title} — photo ${i + 2}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              ))}

              {/* Placeholder si seulement 2 images */}
              {extraImages.length === 1 && (
                <div className="bg-foreground/5" />
              )}
            </div>
          </>
        )}
      </section>

      {/* ── Contenu principal ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Colonne gauche : infos suite + hôtel */}
          <div className="lg:col-span-2">
            {/* En-tête */}
            <p className="text-icon font-semibold text-xs uppercase tracking-widest mb-2">
              {hotel.name} &middot; {hotel.city}
            </p>
            <h1 className="text-4xl font-bold text-foreground mb-8 leading-tight">
              {suite.title}
            </h1>

            <hr className="border-foreground/10 mb-8" />

            {/* Description de la suite */}
            {suite.description ? (
              <div className="mb-10">
                <h2 className="text-xl font-semibold mb-3">
                  À propos de cette suite
                </h2>
                <p className="text-foreground/70 leading-relaxed text-[15px]">
                  {suite.description}
                </p>
              </div>
            ) : (
              <p className="text-foreground/40 italic mb-10 text-sm">
                Aucune description disponible pour cette suite.
              </p>
            )}

            <hr className="border-foreground/10 mb-8" />

            {/* Bloc hôtel */}
            <div className="rounded-2xl border border-foreground/10 bg-foreground/2 p-6">
              <h2 className="text-xl font-semibold mb-5">
                L&apos;établissement
              </h2>

              <div className="flex flex-col gap-1 mb-4">
                <span className="font-semibold text-foreground">
                  {hotel.name}
                </span>
                <span className="text-foreground/60 text-sm">
                  {hotel.address}, {hotel.city}
                </span>
              </div>

              {hotel.description && (
                <p className="text-foreground/60 text-sm leading-relaxed border-t border-foreground/10 pt-4 mb-4">
                  {hotel.description}
                </p>
              )}

              <Link
                href={`/etablissements/${hotel.id}`}
                className="inline-flex items-center gap-1 text-icon text-sm font-medium hover:underline"
              >
                Voir tous les hébergements <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* Colonne droite : carte de réservation (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-2xl border border-foreground/10 shadow-sm p-6">
              {/* Prix */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-foreground">
                  {priceFormatted}
                </p>
                <p className="text-foreground/40 text-sm">par nuit</p>
              </div>

              {/* Réserver */}
              <Link
                href={`/reservation?suite=${suite.id}`}
                className="block w-full text-center bg-icon text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity mb-3"
              >
                Réserver cette suite
              </Link>

              {/* Contacter */}
              <Link
                href={`/contact?etablissement=${hotel.id}`}
                className="block w-full text-center border border-foreground/20 text-foreground font-medium py-3 rounded-xl hover:border-icon hover:text-icon transition-colors text-sm"
              >
                Contacter l&apos;établissement
              </Link>

              <hr className="border-foreground/10 my-6" />

              <p className="text-foreground/40 text-xs text-center leading-relaxed">
                Pour toute question ou demande de réservation, contactez
                directement l&apos;hôtel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Galerie complète (si > 3 images) ────────────────────────── */}
      {suiteImages.length > 3 && (
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <h2 className="text-2xl font-semibold mb-6">Galerie</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {suiteImages.slice(3).map((img, i) => (
              <div
                key={img.id}
                className="relative aspect-video rounded-xl overflow-hidden"
              >
                <Image
                  src={img.link}
                  alt={img.description ?? `${suite.title} — photo ${i + 4}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

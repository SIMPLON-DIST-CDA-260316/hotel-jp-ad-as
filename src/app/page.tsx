import HotelsGrid from "@/components/hotels-grid";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="w-full -mt-20">
      {/* Hero section — pleine largeur */}
      <section className="relative h-[50vh] min-h-125 w-full overflow-hidden">
        <Image
          src="/images/heroImage.png"
          alt="Hôtels JP-AD-AS"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay gradient gauche → transparent */}
        <div className="absolute inset-0 bg-linear-to-r from-foreground/90 via-foreground/60 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-2xl">
          <p className="text-icon font-semibold text-sm uppercase tracking-widest mb-3">
            Groupe hôtelier JP-AD-AS
          </p>
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Hôtels Clair de Lune
          </h1>
          <p className="text-white/85 text-base md:text-lg font-light max-w-md mb-8">
            Réservez directement vos suites dans nos hôtels ruraux en France,
            sans passer par des plateformes tierces.
          </p>
          <Link
            href="/etablissements"
            className="inline-block bg-icon text-white px-8 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity w-fit"
          >
            Voir tous les établissements
          </Link>
        </div>
      </section>

      {/* Section carousel — contenu centré */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">
          Hôtels à la une
        </h2>
        <HotelsGrid variant="carousel" />
      </section>
    </main>
  );
}

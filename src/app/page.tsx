import Link from "next/link";
import HotelsGrid from "@/components/hotels-grid";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <section className="mb-16">
        <h1 className="text-4xl font-semibold mb-4">Hôtel Clair de Lune</h1>
        <p className="text-gray-600 max-w-xl mb-6">
          Réservez directement vos suites dans nos hôtels ruraux en France, sans passer par des plateformes tierces.
        </p>
        <Link
          href="/etablissements"
          className="inline-block bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          Voir tous les établissements
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Hôtels à la une</h2>
        <HotelsGrid variant="carousel" />
      </section>
    </main>
  );
}

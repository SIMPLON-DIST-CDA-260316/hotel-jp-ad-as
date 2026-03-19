import HotelsGrid from "@/components/hotels-grid";

export default function EtablissementsPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Nos établissements</h1>
      <HotelsGrid />
    </main>
  );
}

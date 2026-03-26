import { db } from "@/db";
import { suites } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { requireManager, updateSuite } from "../../actions";
import SuiteForm from "../../suite-form";

export default async function EditSuitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { hotel } = await requireManager();
  if (!hotel) redirect("/manager/suites");

  const { id } = await params;
  const suite = await db
    .select()
    .from(suites)
    .where(eq(suites.id, Number(id)))
    .limit(1)
    .then((rows) => rows[0]);
  if (!suite || suite.hotelId !== hotel.id) notFound();

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Modifier la suite
      </h1>
      <SuiteForm action={updateSuite} suite={suite} submitLabel="Enregistrer" />
    </main>
  );
}

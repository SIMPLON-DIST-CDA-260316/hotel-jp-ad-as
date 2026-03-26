import { redirect } from "next/navigation";
import { createSuite, requireManager } from "../actions";
import SuiteForm from "../suite-form";

export default async function NewSuitePage() {
  const { hotel } = await requireManager();
  if (!hotel) redirect("/manager/suites");

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Nouvelle suite
      </h1>
      <SuiteForm action={createSuite} submitLabel="Créer" />
    </main>
  );
}

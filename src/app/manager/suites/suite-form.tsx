import Link from "next/link";

type Suite = { id: number; title: string; description: string | null; price: string };

const inputClass = "border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";

export default function SuiteForm({
  action,
  suite,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  suite?: Suite;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-5">
      {suite && <input type="hidden" name="id" value={suite.id} />}

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          Titre <span className="text-red-500">*</span>
        </label>
        <input id="title" name="title" type="text" required defaultValue={suite?.title} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea id="description" name="description" rows={4} defaultValue={suite?.description ?? ""} className={`${inputClass} resize-none`} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="price" className="text-sm font-medium">
          Prix par nuit (EUR) <span className="text-red-500">*</span>
        </label>
        <input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={suite?.price} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="images" className="text-sm font-medium">
          {suite ? "Ajouter des images" : "Images"}
        </label>
        <input id="images" name="images" type="file" accept="image/*" multiple className={inputClass} />
      </div>

      <div className="flex items-center gap-3 mt-2">
        <button type="submit" className="bg-icon text-white px-6 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
          {submitLabel}
        </button>
        <Link href="/manager/suites" className="text-foreground/60 text-sm hover:underline">
          Annuler
        </Link>
      </div>
    </form>
  );
}

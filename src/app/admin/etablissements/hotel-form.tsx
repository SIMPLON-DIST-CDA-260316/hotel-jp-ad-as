import Link from "next/link";

type Manager = { id: string; name: string };
type Hotel = { id: number; name: string; city: string; address: string; description: string | null; userId: string | null };

const inputClass = "border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";

export default function HotelForm({
  action,
  managers,
  hotel,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  managers: Manager[];
  hotel?: Hotel;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-5">
      {hotel && <input type="hidden" name="id" value={hotel.id} />}

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nom <span className="text-red-500">*</span>
        </label>
        <input id="name" name="name" type="text" required defaultValue={hotel?.name} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="city" className="text-sm font-medium">
          Ville <span className="text-red-500">*</span>
        </label>
        <input id="city" name="city" type="text" required defaultValue={hotel?.city} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="text-sm font-medium">
          Adresse <span className="text-red-500">*</span>
        </label>
        <input id="address" name="address" type="text" required defaultValue={hotel?.address} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea id="description" name="description" rows={4} defaultValue={hotel?.description ?? ""} className={`${inputClass} resize-none`} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="userId" className="text-sm font-medium">
          Gérant
        </label>
        <select id="userId" name="userId" defaultValue={hotel?.userId ?? ""} className={inputClass}>
          <option value="">Aucun gérant</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <button type="submit" className="bg-icon text-white px-6 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
          {submitLabel}
        </button>
        <Link href="/admin/etablissements" className="text-foreground/60 text-sm hover:underline">
          Annuler
        </Link>
      </div>
    </form>
  );
}

import Link from "next/link";

type Hotel = { id: number; name: string };
type Manager = { id: string; firstname: string; lastname: string; email: string };

const inputClass = "border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";

export default function ManagerForm({
  action,
  hotels,
  manager,
  currentHotelId,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  hotels: Hotel[];
  manager?: Manager;
  currentHotelId?: number | null;
  submitLabel: string;
}) {
  const isEdit = !!manager;

  return (
    <form action={action} className="flex flex-col gap-5">
      {manager && <input type="hidden" name="id" value={manager.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="firstname" className="text-sm font-medium">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            id="firstname"
            name="firstname"
            type="text"
            required
            defaultValue={manager?.firstname}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="lastname" className="text-sm font-medium">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            id="lastname"
            name="lastname"
            type="text"
            required
            defaultValue={manager?.lastname}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={manager?.email}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Mot de passe {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required={!isEdit}
            placeholder={isEdit ? "Laisser vide pour ne pas modifier" : "Min. 8 caractères"}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmer {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required={!isEdit}
            placeholder={isEdit ? "Laisser vide pour ne pas modifier" : ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="hotelId" className="text-sm font-medium">
          Établissement associé
        </label>
        <select
          id="hotelId"
          name="hotelId"
          defaultValue={currentHotelId ?? ""}
          className={inputClass}
        >
          <option value="">Aucun établissement</option>
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <button
          type="submit"
          className="bg-icon text-white px-6 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {submitLabel}
        </button>
        <Link href="/admin/manager" className="text-foreground/60 text-sm hover:underline">
          Annuler
        </Link>
      </div>
    </form>
  );
}

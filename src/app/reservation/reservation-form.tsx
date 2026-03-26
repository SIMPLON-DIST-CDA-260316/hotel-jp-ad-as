"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSuitesByHotel, createReservation } from "./action";

type Hotel = { id: number; name: string };
type Suite = { id: number; title: string; price: string };

export default function ReservationForm({
  hotels,
  defaultHotelId,
  defaultSuiteId,
  defaultSuites,
  isLoggedIn,
}: {
  hotels: Hotel[];
  defaultHotelId?: number;
  defaultSuiteId?: number;
  defaultSuites: Suite[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [suitesList, setSuitesList] = useState<Suite[]>(defaultSuites);
  const [selectedHotelId, setSelectedHotelId] = useState<number | "">(defaultHotelId ?? "");
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | "">(defaultSuiteId ?? "");
  const [dateBegin, setDateBegin] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function handleHotelChange(hotelId: number) {
    setSelectedHotelId(hotelId);
    setSelectedSuiteId("");
    const suites = await getSuitesByHotel(hotelId);
    setSuitesList(suites);
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const result = await createReservation(formData);
    setPending(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/client/reservation?success=true");
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium mb-2">Connexion requise</p>
        <p className="text-foreground/60 mb-8">
          Vous devez être connecté pour effectuer une réservation.
        </p>
        <Link
          href="/login"
          className="inline-block bg-icon text-white px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="hotelId" className="text-sm font-medium">
          Établissement <span className="text-red-500">*</span>
        </label>
        <select
          id="hotelId"
          name="hotelId"
          value={selectedHotelId}
          onChange={(e) => handleHotelChange(Number(e.target.value))}
          required
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="" disabled>
            Sélectionnez un établissement
          </option>
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="suiteId" className="text-sm font-medium">
          Suite <span className="text-red-500">*</span>
        </label>
        <select
          id="suiteId"
          name="suiteId"
          value={selectedSuiteId}
          onChange={(e) => setSelectedSuiteId(Number(e.target.value))}
          required
          disabled={suitesList.length === 0}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" disabled>
            {selectedHotelId ? "Sélectionnez une suite" : "Choisissez d'abord un établissement"}
          </option>
          {suitesList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} — {Number(s.price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}/nuit
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="dateBegin" className="text-sm font-medium">
          Date d&apos;arrivée <span className="text-red-500">*</span>
        </label>
        <input
          id="dateBegin"
          name="dateBegin"
          type="date"
          value={dateBegin}
          min={today}
          onChange={(e) => {
            setDateBegin(e.target.value);
            if (dateEnd && e.target.value >= dateEnd) {
              setDateEnd("");
            }
          }}
          required
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="dateEnd" className="text-sm font-medium">
          Date de départ <span className="text-red-500">*</span>
        </label>
        <input
          id="dateEnd"
          name="dateEnd"
          type="date"
          value={dateEnd}
          min={dateBegin || today}
          onChange={(e) => setDateEnd(e.target.value)}
          required
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-icon text-white px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Réservation en cours..." : "Réserver"}
      </button>
    </form>
  );
}

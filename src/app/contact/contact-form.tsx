"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendContactMessage } from "./actions";

const CONTACT_TOPICS = [
  "Demande d'information",
  "Problème de réservation",
  "Réclamation",
  "Autre",
] as const;

type Hotel = { id: number; name: string };

export default function ContactForm({
  hotels,
  defaultHotelId,
}: {
  hotels: Hotel[];
  defaultHotelId?: number;
}) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await sendContactMessage(formData);
    setPending(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium mb-2">Message envoyé avec succès !</p>
        <p className="text-gray-500 mb-8">Nous vous répondrons dans les plus brefs délais.</p>
        <button
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/");
          }}
          className="inline-block bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          Retour à la page précédente
        </button>
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
          defaultValue={defaultHotelId ?? ""}
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
        <label htmlFor="topic" className="text-sm font-medium">
          Sujet <span className="text-red-500">*</span>
        </label>
        <select
          id="topic"
          name="topic"
          defaultValue=""
          required
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="" disabled>
            Sélectionnez un sujet
          </option>
          {CONTACT_TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nom <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Jean Dupont"
        />
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
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="jean@exemple.fr"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="content" className="text-sm font-medium">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={5}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
          placeholder="Votre message..."
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Envoi en cours..." : "Envoyer le message"}
      </button>
    </form>
  );
}

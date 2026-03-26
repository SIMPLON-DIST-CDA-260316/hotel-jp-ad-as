"use client";

import { deleteHotel } from "./actions";

export default function DeleteButton({ hotelId }: { hotelId: number }) {
  return (
    <form
      action={deleteHotel}
      onSubmit={(e) => {
        if (!confirm("Supprimer cet établissement ?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={hotelId} />
      <button
        type="submit"
        className="text-red-500 text-xs font-medium hover:underline"
      >
        Supprimer
      </button>
    </form>
  );
}

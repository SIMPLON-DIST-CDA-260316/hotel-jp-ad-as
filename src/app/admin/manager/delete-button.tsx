"use client";

import { deleteManager } from "./actions";

export default function DeleteButton({ managerId }: { managerId: string }) {
  return (
    <form
      action={deleteManager}
      onSubmit={(e) => {
        if (!confirm("Supprimer ce gérant ?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={managerId} />
      <button
        type="submit"
        className="text-red-500 text-xs font-medium hover:underline"
      >
        Supprimer
      </button>
    </form>
  );
}

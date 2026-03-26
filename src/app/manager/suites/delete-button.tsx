"use client";

import { deleteSuite } from "./actions";

export default function DeleteButton({ suiteId }: { suiteId: number }) {
  return (
    <form
      action={deleteSuite}
      onSubmit={(e) => {
        if (!confirm("Supprimer cette suite ?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={suiteId} />
      <button type="submit" className="text-red-500 text-xs font-medium hover:underline">
        Supprimer
      </button>
    </form>
  );
}

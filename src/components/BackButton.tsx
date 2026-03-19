"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className="mt-8 inline-block px-8 py-3 rounded-full border border-icon text-icon font-medium hover:bg-icon hover:text-white transition-colors cursor-pointer"
    >
      Retour à la page précédente
    </button>
  );
}

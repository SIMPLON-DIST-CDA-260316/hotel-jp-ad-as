"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

const fields = [
  { name: "firstname", label: "Prénom", type: "text", placeholder: "Jean" },
  { name: "lastname", label: "Nom", type: "text", placeholder: "Dupont" },
  { name: "email", label: "Email", type: "email", placeholder: "jean@exemple.fr" },
  { name: "password", label: "Mot de passe", type: "password", placeholder: "Min. 8 caractères, 1 majuscule, 1 chiffre" },
  { name: "confirmPassword", label: "Confirmer le mot de passe", type: "password", placeholder: "" },
] as const;

const inputClass = "border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";

function validate(f: Record<string, string>): string | null {
  if (fields.some(({ name }) => !f[name]))
    return "Tous les champs sont obligatoires.";
  if (!f.email.includes("@") || !f.email.split("@")[1]?.includes("."))
    return "Format d'email invalide.";
  const hasUppercase = f.password !== f.password.toLowerCase();
  const hasNumber = f.password.split("").some((c) => c >= "0" && c <= "9");
  if (f.password.length < 8 || !hasUppercase || !hasNumber)
    return "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.";
  if (f.password !== f.confirmPassword)
    return "Les mots de passe ne correspondent pas.";
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const f: Record<string, string> = {};
    for (const { name } of fields)
      f[name] = (formData.get(name)?.toString().trim() ?? "");

    const err = validate(f);
    if (err) { setError(err); setPending(false); return; }

    const { error: authError } = await signUp.email({
      email: f.email,
      password: f.password,
      name: `${f.firstname} ${f.lastname}`,
      firstname: f.firstname,
      lastname: f.lastname,
    } as Parameters<typeof signUp.email>[0]);

    if (authError) {
      const msg = authError.message?.toLowerCase() ?? "";
      setError(msg.includes("already") || msg.includes("exist")
        ? "Cette adresse email est déjà utilisée."
        : "Une erreur est survenue lors de l'inscription.");
      setPending(false);
      return;
    }

    setSuccess(true);
    setPending(false);
    setTimeout(() => { router.push("/"); router.refresh(); }, 3000);
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-semibold mb-3">Bienvenue parmi nous !</h2>
        <p className="text-foreground/60 text-sm">
          Votre compte a bien été créé. Vous allez être redirigé...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-2">Inscription</h1>
      <p className="text-gray-500 mb-8">Créez votre compte pour réserver nos suites.</p>

      <form action={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {fields.slice(0, 2).map(({ name, label, type, placeholder }) => (
            <div key={name} className="flex flex-col gap-1">
              <label htmlFor={name} className="text-sm font-medium">
                {label} <span className="text-red-500">*</span>
              </label>
              <input id={name} name={name} type={type} required className={inputClass} placeholder={placeholder} />
            </div>
          ))}
        </div>

        {fields.slice(2).map(({ name, label, type, placeholder }) => (
          <div key={name} className="flex flex-col gap-1">
            <label htmlFor={name} className="text-sm font-medium">
              {label} <span className="text-red-500">*</span>
            </label>
            <input id={name} name={name} type={type} required className={inputClass} placeholder={placeholder} />
          </div>
        ))}

        <button type="submit" disabled={pending}
          className="self-start bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {pending ? "Inscription en cours..." : "Créer mon compte"}
        </button>

        <p className="text-sm text-gray-500">
          Déjà inscrit ?{" "}
          <Link href="/login" className="text-foreground font-medium hover:text-icon transition-colors underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}

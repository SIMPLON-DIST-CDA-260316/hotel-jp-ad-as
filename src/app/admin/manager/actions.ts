"use server";

import { db } from "@/db";
import { hotels, users } from "@/db/schema";
import { and, eq, isNull, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") redirect("/");
  return session;
}

function parseManagerFields(formData: FormData) {
  const firstname = formData.get("firstname")?.toString().trim();
  const lastname = formData.get("lastname")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";
  const hotelId = formData.get("hotelId")?.toString() || null;

  if (!firstname || !lastname || !email) {
    return { error: "Le prénom, le nom et l'email sont obligatoires." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Format d'email invalide." };
  }

  return { firstname, lastname, email, password, confirmPassword, hotelId: hotelId ? Number(hotelId) : null };
}

export async function createManager(formData: FormData) {
  await requireAdmin();

  const fields = parseManagerFields(formData);
  if ("error" in fields) return fields;

  const { firstname, lastname, email, password, confirmPassword, hotelId } = fields;

  if (!password) {
    return { error: "Le mot de passe est obligatoire." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return { error: "Cette adresse email est déjà utilisée." };
  }

  const { user: newUser } = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: `${firstname} ${lastname}`,
      firstname,
      lastname,
    },
  });

  await db
    .update(users)
    .set({ role: "manager" })
    .where(eq(users.id, newUser.id));

  if (hotelId) {
    await db
      .update(hotels)
      .set({ userId: newUser.id })
      .where(and(eq(hotels.id, hotelId), isNull(hotels.userId)));
  }

  revalidatePath("/admin/manager");
  redirect("/admin/manager");
}

export async function updateManager(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString();
  if (!id) return { error: "Identifiant manquant." };

  const fields = parseManagerFields(formData);
  if ("error" in fields) return fields;

  const { firstname, lastname, email, password, confirmPassword, hotelId } = fields;

  const manager = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(and(eq(users.id, id), eq(users.role, "manager")))
    .limit(1)
    .then((rows) => rows[0]);

  if (!manager) return { error: "Gérant introuvable." };

  const emailConflict = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), ne(users.id, id)))
    .limit(1);
  if (emailConflict.length > 0) {
    return { error: "Cette adresse email est déjà utilisée." };
  }

  await db
    .update(users)
    .set({
      firstname,
      lastname,
      email,
      name: `${firstname} ${lastname}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));

  if (password) {
    if (password.length < 8) {
      return { error: "Le mot de passe doit contenir au moins 8 caractères." };
    }
    if (password !== confirmPassword) {
      return { error: "Les mots de passe ne correspondent pas." };
    }
    await auth.api.setUserPassword({
      body: { userId: id, newPassword: password },
      headers: await headers(),
    });
  }

  // Désassocier l'ancien hôtel du gérant
  await db
    .update(hotels)
    .set({ userId: null })
    .where(eq(hotels.userId, id));

  // Associer le nouvel hôtel si sélectionné
  if (hotelId) {
    await db
      .update(hotels)
      .set({ userId: id })
      .where(and(eq(hotels.id, hotelId), isNull(hotels.userId)));
  }

  revalidatePath("/admin/manager");
  redirect("/admin/manager");
}

export async function deleteManager(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString();
  if (!id) return;

  const manager = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, id), eq(users.role, "manager")))
    .limit(1)
    .then((rows) => rows[0]);

  if (!manager) return;

  await db.update(hotels).set({ userId: null }).where(eq(hotels.userId, id));
  await db.delete(users).where(eq(users.id, id));

  revalidatePath("/admin/manager");
}

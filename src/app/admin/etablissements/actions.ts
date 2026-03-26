"use server";

import { db } from "@/db";
import { hotels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") redirect("/");
  return session;
}

function parseHotelFields(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const city = formData.get("city")?.toString().trim();
  const address = formData.get("address")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const userId = formData.get("userId")?.toString() || null;

  if (!name || !city || !address) {
    return { error: "Le nom, la ville et l'adresse sont obligatoires." };
  }

  return { name, city, address, description, userId };
}

export async function createHotel(formData: FormData) {
  await requireAdmin();
  const fields = parseHotelFields(formData);
  if ("error" in fields) return fields;

  await db.insert(hotels).values(fields);
  revalidatePath("/admin/etablissements");
  redirect("/admin/etablissements");
}

export async function updateHotel(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const fields = parseHotelFields(formData);
  if (!id || "error" in fields) return { error: "Données invalides." };

  await db.update(hotels).set(fields).where(eq(hotels.id, id));
  revalidatePath("/admin/etablissements");
  redirect("/admin/etablissements");
}

export async function deleteHotel(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await db.delete(hotels).where(eq(hotels.id, id));
  revalidatePath("/admin/etablissements");
}

"use server";

import { db } from "@/db";
import { messages, hotels } from "@/db/schema";
import { eq } from "drizzle-orm";

const CONTACT_TOPICS = [
  "Demande d'information",
  "Problème de réservation",
  "Réclamation",
  "Autre",
] as const;

type Topic = (typeof CONTACT_TOPICS)[number];

export async function sendContactMessage(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const topic = formData.get("topic")?.toString();
  const hotelId = Number(formData.get("hotelId"));
  const content = formData.get("content")?.toString().trim();

  if (!name || !email || !topic || !hotelId || !content) {
    return { error: "Tous les champs sont obligatoires." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Format d'email invalide." };
  }

  if (!CONTACT_TOPICS.includes(topic as Topic)) {
    return { error: "Sujet invalide." };
  }

  const hotel = await db.select({ id: hotels.id }).from(hotels).where(eq(hotels.id, hotelId));
  if (hotel.length === 0) {
    return { error: "Établissement introuvable." };
  }

  await db.insert(messages).values({
    visitorName: name,
    visitorEmail: email,
    topic,
    content,
    hotelId,
  });

  return { success: true };
}

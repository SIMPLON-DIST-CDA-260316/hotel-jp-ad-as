"use server";

import { db } from "@/db";
import { hotels, suites, images } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function requireManager() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "manager") redirect("/");

  const hotel = await db
    .select()
    .from(hotels)
    .where(eq(hotels.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  return { session, hotel };
}

function parseSuiteFields(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const price = formData.get("price")?.toString().trim();
  if (!title || !price) return { error: "Le titre et le prix sont obligatoires." };
  return { title, description, price };
}

async function saveImage(file: File): Promise<string> {
  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(process.cwd(), "public/images", filename), buffer);
  return `/images/${filename}`;
}

export async function createSuite(formData: FormData) {
  const { hotel } = await requireManager();
  if (!hotel) return { error: "Aucun établissement assigné." };

  const fields = parseSuiteFields(formData);
  if ("error" in fields) return fields;

  const [suite] = await db
    .insert(suites)
    .values({ ...fields, hotelId: hotel.id })
    .returning({ id: suites.id });

  const imageFiles = formData.getAll("images") as File[];
  for (const file of imageFiles) {
    if (file.size > 0) {
      const link = await saveImage(file);
      await db.insert(images).values({ link, suiteId: suite.id });
    }
  }

  revalidatePath("/manager/suites");
  redirect("/manager/suites");
}

export async function updateSuite(formData: FormData) {
  const { hotel } = await requireManager();
  if (!hotel) return { error: "Aucun établissement assigné." };

  const id = Number(formData.get("id"));
  const fields = parseSuiteFields(formData);
  if (!id || "error" in fields) return { error: "Données invalides." };

  const suite = await db.select().from(suites).where(eq(suites.id, id)).limit(1).then((rows) => rows[0]);
  if (!suite || suite.hotelId !== hotel.id) return { error: "Suite introuvable." };

  await db.update(suites).set(fields).where(eq(suites.id, id));

  const imageFiles = formData.getAll("images") as File[];
  for (const file of imageFiles) {
    if (file.size > 0) {
      const link = await saveImage(file);
      await db.insert(images).values({ link, suiteId: id });
    }
  }

  revalidatePath("/manager/suites");
  redirect("/manager/suites");
}

export async function deleteSuite(formData: FormData) {
  const { hotel } = await requireManager();
  if (!hotel) return;

  const id = Number(formData.get("id"));
  if (!id) return;

  const suite = await db
    .select()
    .from(suites)
    .where(eq(suites.id, id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!suite || suite.hotelId !== hotel.id) return;

  const suiteImages = await db
    .select({ link: images.link })
    .from(images)
    .where(eq(images.suiteId, id));

  for (const img of suiteImages) {
    try {
      await unlink(path.join(process.cwd(), "public", img.link));
    } catch {}
  }

  await db.delete(suites).where(eq(suites.id, id));

  revalidatePath("/manager/suites");
}

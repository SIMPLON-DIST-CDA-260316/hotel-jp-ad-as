import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { hotels, suites, images } from "@/db/schema";
import { count, eq, sql } from "drizzle-orm";
import HotelsCarouselClient from "./hotels-carousel-client";

const FALLBACK_IMAGE = "/images/hotels/le-grand-palais.jpg";

type Props = {
  variant?: "grid" | "carousel";
};

export default async function HotelsGrid({ variant = "grid" }: Props) {
  const hotelList = await db
    .select({
      id: hotels.id,
      name: hotels.name,
      city: hotels.city,
      description: hotels.description,
      suiteCount: count(suites.id),
      image: sql<string | null>`(SELECT link FROM "image" WHERE "image".hotel_id = ${hotels.id} LIMIT 1)`,
    })
    .from(hotels)
    .leftJoin(suites, eq(suites.hotelId, hotels.id))
    .groupBy(hotels.id);

  if (hotelList.length === 0) {
    return <p className="text-gray-500">Aucun établissement disponible pour le moment.</p>;
  }

  if (variant === "carousel") {
    const shuffled = await db
      .select({
        id: hotels.id,
        name: hotels.name,
        city: hotels.city,
        description: hotels.description,
        suiteCount: count(suites.id),
        image: sql<string | null>`(SELECT link FROM "image" WHERE "image".hotel_id = ${hotels.id} LIMIT 1)`,
      })
      .from(hotels)
      .leftJoin(suites, eq(suites.hotelId, hotels.id))
      .groupBy(hotels.id)
      .orderBy(sql`RANDOM()`);

    const hotelsWithImages = shuffled.map((hotel) => ({
      ...hotel,
      suiteCount: String(hotel.suiteCount),
      image: hotel.image ?? FALLBACK_IMAGE,
    }));

    return <HotelsCarouselClient hotels={hotelsWithImages} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hotelList.map((hotel) => (
        <Link
          key={hotel.id}
          href={`/etablissements/${hotel.id}`}
          className="block border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="relative h-48 w-full">
            <Image
              src={hotel.image ?? FALLBACK_IMAGE}
              alt={hotel.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-1">{hotel.name}</h2>
            <p className="text-sm text-gray-500 mb-3">{hotel.city}</p>
            {hotel.description && (
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">{hotel.description}</p>
            )}
            <p className="text-sm font-medium">
              {hotel.suiteCount} suite{Number(hotel.suiteCount) > 1 ? "s" : ""}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

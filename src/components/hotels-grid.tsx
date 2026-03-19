import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { hotels, suites } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import HotelsCarouselClient from "./hotels-carousel-client";

const hotelImages: Record<string, string> = {
  "Le Grand Palais": "/images/hotels/le-grand-palais.jpg",
  "Château des Lumières": "/images/hotels/chateau-des-lumieres.jpg",
  "L'Élégance Dorée": "/images/hotels/elegance-doree.avif",
  "Villa Belle Époque": "/images/hotels/villa-belle-epoque.jpg",
  "Les Terrasses du Midi": "/images/hotels/terasse-du-midi.jpg",
  "Manoir Saint-Germain": "/images/hotels/manoir-saint-germain.jpg",
  "L'Étoile de Paris": "/images/hotels/etoile-de-paris.avif",
  "Le Refuge des Alpes": "/images/hotels/refuge-des-alpes.jpg",
  "La Maison Dorée": "/images/hotels/maison-doree.png",
  "Hôtel des Grands Crus": "/images/hotels/hotel-des-grands-crus.webp",
};

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
    })
    .from(hotels)
    .leftJoin(suites, eq(suites.hotelId, hotels.id))
    .groupBy(hotels.id);

  if (hotelList.length === 0) {
    return <p className="text-gray-500">Aucun établissement disponible pour le moment.</p>;
  }

  if (variant === "carousel") {
    const hotelsWithImages = hotelList.map((hotel) => ({
      ...hotel,
      suiteCount: String(hotel.suiteCount),
      image: hotelImages[hotel.name] ?? "/images/hotels/le-grand-palais.jpg",
    }));

    for (let i = hotelsWithImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [hotelsWithImages[i], hotelsWithImages[j]] = [hotelsWithImages[j], hotelsWithImages[i]];
    }

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
              src={hotelImages[hotel.name] ?? "/images/hotels/le-grand-palais.jpg"}
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

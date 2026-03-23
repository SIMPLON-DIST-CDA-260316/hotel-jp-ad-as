"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";

type Hotel = {
  id: number;
  name: string;
  city: string;
  description: string | null;
  suiteCount: string;
  image: string;
};

export default function HotelsCarouselClient({ hotels }: { hotels: Hotel[] }) {
  const ref = useRef<HTMLDivElement>(null);

  function scrollRight() {
    ref.current?.scrollBy({ left: 300, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        className="grid grid-cols-2 gap-4 md:flex md:overflow-x-auto md:snap-x md:snap-mandatory no-scrollbar"
      >
        {hotels.map((hotel) => (
          <Link
            key={hotel.id}
            href={`/etablissements/${hotel.id}`}
            className="md:snap-start md:shrink-0 md:w-[calc(25%-12px)] group border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative h-40 w-full">
              <Image
                src={hotel.image}
                alt={hotel.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold mb-1 line-clamp-1">{hotel.name}</h3>
              <p className="text-sm text-gray-500">{hotel.city}</p>
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={scrollRight}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 items-center justify-center w-10 h-10 rounded-full bg-white border shadow-md hover:shadow-lg transition-shadow"
        aria-label="Suivant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

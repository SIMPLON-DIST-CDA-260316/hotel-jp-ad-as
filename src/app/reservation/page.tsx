import { db } from "@/db";
import { hotels, suites } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ReservationForm from "./reservation-form";
import { getSuitesByHotel } from "./action";

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  const { suite: suiteParam } = await searchParams;

  const session = await auth.api.getSession({ headers: await headers() });
  const isLoggedIn = !!session?.user;

  const allHotels = await db
    .select({ id: hotels.id, name: hotels.name })
    .from(hotels);

  let defaultHotelId: number | undefined;
  let defaultSuiteId: number | undefined;
  let defaultSuites: { id: number; title: string; price: string }[] = [];

  if (suiteParam) {
    const suite = await db
      .select()
      .from(suites)
      .where(eq(suites.id, Number(suiteParam)))
      .limit(1)
      .then((rows) => rows[0]);

    if (suite) {
      defaultSuiteId = suite.id;
      defaultHotelId = suite.hotelId;
      defaultSuites = await getSuitesByHotel(suite.hotelId);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
        Réserver une suite
      </h1>
      <ReservationForm
        hotels={allHotels}
        defaultHotelId={defaultHotelId}
        defaultSuiteId={defaultSuiteId}
        defaultSuites={defaultSuites}
        isLoggedIn={isLoggedIn}
      />
    </main>
  );
}

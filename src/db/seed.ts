import { db } from "./index";
import { users, hotels, suites, images, reservations } from "./schema";
import { faker } from "@faker-js/faker/locale/fr";

async function seed() {
  console.log("Nettoyage des données existantes...");
  await db.delete(reservations);
  await db.delete(images);
  await db.delete(suites);
  await db.delete(hotels);
  await db.delete(users);

  console.log("Création des utilisateurs...");
  const createdUsers = await db.insert(users).values([
    {
      firstname: "Admin",
      lastname: "Hôtel",
      email: "admin@hotel.com",
      hashedPassword: "hashed_placeholder",
      role: "admin",
    },
    ...Array.from({ length: 5 }, () => ({
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      email: faker.internet.email(),
      hashedPassword: "hashed_placeholder",
      role: "client" as const,
    })),
  ]).returning();

  const adminUser = createdUsers[0];
  const clientUsers = createdUsers.slice(1);

  console.log("Création des hôtels...");
  const hotelNames = [
    "Le Grand Palais",
    "Château des Lumières",
    "L'Élégance Dorée",
    "Villa Belle Époque",
    "Les Terrasses du Midi",
    "Manoir Saint-Germain",
    "L'Étoile de Paris",
    "Le Refuge des Alpes",
    "La Maison Dorée",
    "Hôtel des Grands Crus",
  ];

  const frenchCities = ["Paris", "Lyon", "Bordeaux", "Nice", "Strasbourg", "Marseille", "Toulouse", "Nantes", "Biarritz", "Annecy"];

  const createdHotels = await db.insert(hotels).values(
    hotelNames.map((name, i) => ({
      name,
      city: frenchCities[i],
      address: faker.location.streetAddress(),
      description: faker.lorem.paragraph(),
      userId: adminUser.id,
    }))
  ).returning();

  console.log("Création des images hôtels...");
  const hotelImageMap: Record<string, string> = {
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

  await db.insert(images).values(
    createdHotels
      .filter((h) => hotelImageMap[h.name])
      .map((h) => ({
        link: hotelImageMap[h.name],
        hotelId: h.id,
      }))
  );

  console.log("Création des suites et images...");
  for (const hotel of createdHotels) {
    const suiteCount = faker.number.int({ min: 3, max: 5 });
    const suiteTypes = ["Deluxe", "Prestige", "Royale", "Exécutive", "Junior"];

    const createdSuites = await db.insert(suites).values(
      Array.from({ length: suiteCount }, (_, i) => ({
        title: `Suite ${suiteTypes[i % suiteTypes.length]}`,
        description: faker.lorem.sentences(2),
        price: faker.number.float({ min: 150, max: 800, fractionDigits: 2 }).toString(),
        hotelId: hotel.id,
      }))
    ).returning();

    for (const suite of createdSuites) {
      await db.insert(images).values(
        Array.from({ length: faker.number.int({ min: 2, max: 4 }) }, () => ({
          link: `https://picsum.photos/seed/${faker.string.alphanumeric(8)}/800/600`,
          description: faker.lorem.sentence(),
          suiteId: suite.id,
        }))
      );
    }
  }

  console.log("Création des réservations...");
  const allSuites = await db.query.suites.findMany();

  for (const client of clientUsers) {
    const reservationCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < reservationCount; i++) {
      const dateBegin = faker.date.future();
      const dateEnd = new Date(dateBegin);
      dateEnd.setDate(dateEnd.getDate() + faker.number.int({ min: 1, max: 7 }));

      await db.insert(reservations).values({
        dateBegin: dateBegin.toISOString().split("T")[0],
        dateEnd: dateEnd.toISOString().split("T")[0],
        status: faker.helpers.arrayElement(["confirmed", "cancelled"]),
        userId: client.id,
        suiteId: faker.helpers.arrayElement(allSuites).id,
      });
    }
  }

  console.log("Seed terminé !");
  console.log(`  ${createdUsers.length} utilisateurs`);
  console.log(`  ${createdHotels.length} hôtels`);
  console.log(`  ~${createdHotels.length * 4} suites`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

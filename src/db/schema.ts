import { pgTable, serial, varchar, text, numeric, integer, date, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("user", {
  id: serial("id").primaryKey(),
  firstname: varchar("firstname", { length: 50 }).notNull(),
  lastname: varchar("lastname", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("client"),
}, (table) => [
  check("role_check", sql`${table.role} IN ('client', 'admin', 'manager')`),
]);

export const hotels = pgTable("hotel", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  city: varchar("city", { length: 50 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
});

export const suites = pgTable("suite", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 50 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  hotelId: integer("hotel_id").notNull().references(() => hotels.id, { onDelete: "cascade" }),
}, (table) => [
  check("price_check", sql`${table.price} >= 0`),
]);

export const images = pgTable("image", {
  id: serial("id").primaryKey(),
  link: varchar("link", { length: 255 }).notNull(),
  description: text("description").notNull(),
  suiteId: integer("suite_id").notNull().references(() => suites.id, { onDelete: "cascade" }),
});

export const reservations = pgTable("reservation", {
  id: serial("id").primaryKey(),
  dateBegin: date("date_begin").notNull(),
  dateEnd: date("date_end").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("confirmed"),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  suiteId: integer("suite_id").notNull().references(() => suites.id, { onDelete: "cascade" }),
}, (table) => [
  check("date_check", sql`${table.dateEnd} > ${table.dateBegin}`),
  check("status_check", sql`${table.status} IN ('confirmed', 'cancelled')`),
]);

export const messages = pgTable("message", {
  id: serial("id").primaryKey(),
  topic: varchar("topic", { length: 50 }).notNull(),
  content: text("content"),
  visitorEmail: varchar("visitor_email", { length: 255 }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  hotelId: integer("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
}, (table) => [
  check("contact_check", sql`${table.visitorEmail} IS NOT NULL OR ${table.userId} IS NOT NULL`),
]);

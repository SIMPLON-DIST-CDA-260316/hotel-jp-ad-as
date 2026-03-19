import { pgTable, serial, varchar, text, numeric, integer, date, check, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ── Better Auth tables ────────────────────────────────────────────────────────

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  // Champs custom
  firstname: text("firstname").notNull().default(""),
  lastname: text("lastname").notNull().default(""),
  role: varchar("role", { length: 20 }).notNull().default("client"),
}, (table) => [
  check("role_check", sql`${table.role} IN ('client', 'admin', 'manager')`),
]);

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ── Domaine métier ────────────────────────────────────────────────────────────

export const hotels = pgTable("hotel", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  city: varchar("city", { length: 50 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  description: text("description"),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
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
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  hotelId: integer("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
}, (table) => [
  check("contact_check", sql`${table.visitorEmail} IS NOT NULL OR ${table.userId} IS NOT NULL`),
]);

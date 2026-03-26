import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  emailAndPassword: { enabled: true },

  user: {
    additionalFields: {
      firstname: { type: "string", required: true, defaultValue: "", input: true },
      lastname:  { type: "string", required: true, defaultValue: "", input: true },
      role:      { type: "string", required: false, defaultValue: "client", input: false },
    },
  },

  plugins: [admin({ defaultRole: "client" })],

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

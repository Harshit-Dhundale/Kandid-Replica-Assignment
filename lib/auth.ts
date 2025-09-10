// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";

// Ensure secret exists
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

// Try to load the generated auth schema if present.
// This makes the Better Auth CLI happy BEFORE the file exists.
let resolvedSchema: any | undefined = undefined;
try {
  // Top-level await is supported in Next.js server code.
  resolvedSchema = await import("@/drizzle/auth-schema")
    .then((m) => m)
    .catch(() => undefined);
} catch {
  // ignore — schema will be added after CLI generation
}

export const auth = betterAuth({
  database: drizzleAdapter(
    db,
    // pass schema only if it exists yet
    { provider: "pg", ...(resolvedSchema ? { schema: resolvedSchema } : {}) }
  ),

  // Core config
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,

  // Methods
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [nextCookies()],
});

// Types (optional)
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session["user"];

// lib/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "dotenv";

// Load .env.local when used outside Next (e.g., seed scripts)
if (!process.env.DATABASE_URL) {
  config({ path: ".env.local" });
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Reuse Pool in dev to avoid exhausting connection limits on HMR
declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
}

const pool =
  globalThis.__dbPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (!globalThis.__dbPool) {
  globalThis.__dbPool = pool;
}

export const db = drizzle(pool);
export const endPool = async () => pool.end();

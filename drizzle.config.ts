// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
config({ path: ".env.local" });

export default defineConfig({
  // include BOTH your app schema and the generated auth schema
  schema: ["./drizzle/schema.ts", "./drizzle/auth-schema.ts"],
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});

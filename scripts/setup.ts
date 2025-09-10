import "dotenv/config"
import { execSync } from "child_process"
import { db, endPool } from "../lib/db"

async function setup() {
  console.log("🚀 Setting up LinkBird.ai clone...")

  const requiredEnvVars = ["DATABASE_URL", "BETTER_AUTH_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.log("❌ Missing required environment variables:")
    missingVars.forEach((varName) => console.log(`   - ${varName}`))
    console.log("\n📋 Please set these environment variables and try again.")
    console.log("💡 See the setup guide in README.md for instructions.")
    process.exit(1)
  }

  try {
    // Run Drizzle migrations
    console.log("📦 Generating and running database migrations...")
    execSync("npx drizzle-kit generate", { stdio: "inherit" })
    execSync("npx drizzle-kit migrate", { stdio: "inherit" })

    // Check if we need to seed
    const result = await db.execute("SELECT COUNT(*) as count FROM campaigns")
    const count = (result.rows[0] as any)?.count || 0

    if (count === 0) {
      console.log("🌱 Seeding database with sample data...")
      execSync("npx tsx drizzle/seed.ts", { stdio: "inherit" })
    } else {
      console.log("✅ Database already contains data, skipping seed")
    }

    console.log("✅ Setup complete!")
    console.log("\n🎉 Your LinkBird.ai clone is ready!")
    console.log("Run: npm run dev")
  } catch (error) {
    console.error("❌ Setup failed:", error)
    process.exit(1)
  } finally {
    await endPool()
  }
}

setup()

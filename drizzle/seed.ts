import "dotenv/config"
import { db, endPool } from "../lib/db"
import { accounts, campaignAccounts, campaigns, leadInteractions, leads, messageTemplates } from "./schema"

// Helpers
const now = () => new Date()
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

async function main() {
  console.log("🌱 Seeding database…")

  // ───────────────── Clean (child → parent) ─────────────────
  await db.delete(leadInteractions)
  await db.delete(leads)
  await db.delete(messageTemplates)
  await db.delete(campaignAccounts)
  await db.delete(accounts)
  await db.delete(campaigns)

  // For demo we'll use a single "owner" user id.
  // Replace with an actual Better Auth user id after first signup.
  const OWNER_USER_ID = process.env.SEED_OWNER_USER_ID ?? "00000000-0000-0000-0000-000000000001"

  // ───────────────── Campaigns ─────────────────
  const [justHerbs, healthyHey, digiSidekick] = await db
    .insert(campaigns)
    .values([
      {
        name: "Just Herbs",
        status: "active",
        createdBy: OWNER_USER_ID,
        startDate: daysAgo(8),
      },
      {
        name: "HealthyHey 2",
        status: "active",
        createdBy: OWNER_USER_ID,
        startDate: daysAgo(14),
      },
      {
        name: "Digi Sidekick",
        status: "paused",
        createdBy: OWNER_USER_ID,
        startDate: daysAgo(21),
      },
    ])
    .returning()

  // ───────────────── Accounts & Autopilot mapping ─────────────────
  const [jivesh, bhavya] = await db
    .insert(accounts)
    .values([
      {
        userId: OWNER_USER_ID,
        type: "linkedin",
        displayName: "Jivesh Lakhani",
        email: "jivesh@gmail.com",
      },
      {
        userId: OWNER_USER_ID,
        type: "linkedin",
        displayName: "Bhavya Arora",
        email: "bhavya@kandid.ai",
      },
    ])
    .returning()

  await db.insert(campaignAccounts).values([{ campaignId: justHerbs.id, accountId: jivesh.id, autopilot: true }])

  // ───────────────── Message templates (Sequence tab) ─────────────────
  await db.insert(messageTemplates).values([
    {
      campaignId: justHerbs.id,
      requestMessage:
        "Hi {{firstName}}, I'm building consultative AI salespersons for personal care brands with a guarantee to boost D2C revenue by min of 2%. Would love to connect if you're open to exploring this for Just Herbs!",
      connectionMessage:
        "Awesome to connect, {{firstName}}! These are consultative salespersons that engage like an offline store salesperson and help with product recommendations. Here's a video to visualise it better: https://youtu.be/33Lx8vg-vPo",
      followup1: "Would you like to explore a POC for Just Herbs?",
      followup1DelayDays: 1,
      followup2:
        "Hi {{firstName}}, just following up on my message. Try it for 1 week—no cost. If it doesn't deliver results, you can remove it.",
      followup2DelayDays: 1,
    },
    {
      campaignId: healthyHey.id,
      requestMessage:
        "Hi {{firstName}}, quick note—testing an AI-led assistant to improve PDP conversions. Open to a short POC?",
      connectionMessage: "Thanks for connecting, {{firstName}}. Happy to share a deck and sample flows if useful.",
      followup1: "Circling back on the assistant POC—shall we schedule 15 mins?",
      followup2: "Last nudge from me, {{firstName}}—happy to pause if not a fit.",
    },
  ])

  // ───────────────── Leads ─────────────────
  // Some names from your screenshots for fidelity
  const justHerbsLeadNames = [
    ["Sumeet", "Malhotra"],
    ["Megha", "Sabhlok"],
    ["Archee", "P."],
    ["Hindustan", "Herbs"],
    ["Ritika", "Ohri"],
    ["Praveen Kumar", "Gautam"],
    ["Shubham", "Saboo"],
    ["Om", "Satyarthy"],
    ["Dilbag", "Singh"],
    ["Surdeep", "Singh"],
    ["Sunil", "Pal"],
  ]

  const moreFirst = [
    "Rahul",
    "Aman",
    "Neha",
    "Isha",
    "Karan",
    "Vansh",
    "Shreya",
    "Ankit",
    "Sonia",
    "Deepak",
    "Nandita",
    "Akshay",
    "Rohit",
    "Sneha",
    "Arjun",
  ]

  const moreLast = [
    "Mehta",
    "Sharma",
    "Kapoor",
    "Gupta",
    "Bansal",
    "Chopra",
    "Verma",
    "Khanna",
    "Rastogi",
    "Maheshwari",
    "Iyer",
    "Nair",
  ]

  const companies = ["Just Herbs", "HealthyHey", "Digi Sidekick", "Gynoveda", "The Skin Story", "Pokonut", "Re'equil"]

  const titles = [
    "Brand Manager",
    "Regional Head",
    "VP - Sales",
    "Content & Marketing Specialist",
    "Manager Marketing & Communications",
    "Founder",
    "Deputy Manager",
  ]

  const statuses = ["pending", "contacted", "responded", "converted"] as const

  // Insert "hero" leads for Just Herbs (visible in screenshots)
  const specificJustHerbsLeads = await db
    .insert(leads)
    .values(
      justHerbsLeadNames.map(([fn, ln], i) => ({
        fullName: `${fn} ${ln}`,
        firstName: fn,
        lastName: ln,
        email: `${fn.toLowerCase().replace(/\s/g, "")}.${(ln || "x").toLowerCase().replace(/\s/g, "")}@example.com`,
        company: "Just Herbs",
        jobTitle: pick(titles),
        campaignId: justHerbs.id,
        status: i % 3 === 0 ? "contacted" : i % 4 === 0 ? "responded" : "pending",
        lastContactAt: i % 2 === 0 ? daysAgo(1 + (i % 5)) : null,
      })),
    )
    .returning()

  // Generate more random leads across all campaigns to reach ~60
  const generatedLeads = []
  for (let i = 0; i < 48; i++) {
    const first = pick(moreFirst)
    const last = pick(moreLast)
    const camp = pick([justHerbs, healthyHey, digiSidekick])
    const st = pick(statuses)
    generatedLeads.push({
      fullName: `${first} ${last}`,
      firstName: first,
      lastName: last,
      email: `${first}.${last}`.toLowerCase() + "@example.com",
      company: pick(companies),
      jobTitle: pick(titles),
      campaignId: camp.id,
      status: st,
      lastContactAt: ["contacted", "responded", "converted"].includes(st)
        ? daysAgo(2 + Math.floor(Math.random() * 12))
        : null,
    })
  }

  const otherLeads = await db.insert(leads).values(generatedLeads).returning()

  // ───────────────── Interactions (timeline for a few leads) ─────────────────
  const sampleTimeline = [
    {
      type: "invitation_request",
      message:
        "Message: Hi {{firstName}}, I'm building consultative AI salespersons… Would love to connect for Just Herbs!",
      daysBefore: 6,
    },
    { type: "connection_status", message: "Check connection status", daysBefore: 5 },
    {
      type: "acceptance_msg",
      message: "Message: Awesome to connect, {{firstName}}!",
      daysBefore: 4,
    },
    {
      type: "followup_1",
      message: "Would you like to explore a POC for Just Herbs?",
      daysBefore: 2,
    },
    { type: "followup_2", message: "Just following up on my message.", daysBefore: 1 },
  ] as const

  const timelineTargets = [
    specificJustHerbsLeads[0]?.id,
    specificJustHerbsLeads[1]?.id,
    specificJustHerbsLeads[2]?.id,
  ].filter(Boolean) as string[]

  for (const leadId of timelineTargets) {
    await db.insert(leadInteractions).values(
      sampleTimeline.map((t) => ({
        leadId,
        type: t.type,
        message: t.message,
        createdAt: daysAgo(t.daysBefore),
      })),
    )
  }

  console.log(
    `✅ Seeded: campaigns=${[justHerbs, healthyHey, digiSidekick].length}, leads=${
      specificJustHerbsLeads.length + otherLeads.length
    }, interactions=${timelineTargets.length * sampleTimeline.length}`,
  )
  
  // Log the campaign IDs for debugging
  console.log("Campaign IDs:", {
    justHerbs: justHerbs.id,
    healthyHey: healthyHey.id,
    digiSidekick: digiSidekick.id
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await endPool()
  })

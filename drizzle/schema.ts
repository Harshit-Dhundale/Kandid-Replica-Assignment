import { pgTable, uuid, text, timestamp, boolean, pgEnum, integer, serial, index } from "drizzle-orm/pg-core"
// app/api/whatever/route.ts
export const runtime = 'nodejs'


// ───────────────── Enums ─────────────────
export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "active", "paused", "completed"])

export const leadStatusEnum = pgEnum("lead_status", [
  "pending",
  "contacted",
  "responded",
  "converted",
  "do_not_contact",
])

// ───────────────── Tables ─────────────────
export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    status: campaignStatusEnum("status").notNull().default("active"),
    createdBy: uuid("created_by").notNull(), // users.id (Better Auth)
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    startDate: timestamp("start_date", { withTimezone: true }),
    archived: boolean("archived").default(false),
  },
  (t) => ({
    created_idx: index("campaigns_created_idx").on(t.createdAt),
    status_idx: index("campaigns_status_idx").on(t.status),
  }),
)

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email"),
    company: text("company"),
    jobTitle: text("job_title"),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    status: leadStatusEnum("status").notNull().default("pending"),
    lastContactAt: timestamp("last_contact_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    campaign_idx: index("leads_campaign_idx").on(t.campaignId),
    status_idx: index("leads_status_idx").on(t.status),
    last_contact_idx: index("leads_last_contact_idx").on(t.lastContactAt),
  }),
)

export const leadInteractions = pgTable("lead_interactions", {
  id: serial("id").primaryKey(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // invitation_request, connection_status, acceptance_msg, followup_1, followup_2, replied, note
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const messageTemplates = pgTable("message_templates", {
  id: serial("id").primaryKey(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  requestMessage: text("request_message"),
  connectionMessage: text("connection_message"),
  followup1: text("followup_1"),
  followup1DelayDays: integer("followup_1_delay_days").default(1),
  followup2: text("followup_2"),
  followup2DelayDays: integer("followup_2_delay_days").default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(), // owner
  type: text("type").notNull().default("linkedin"),
  displayName: text("display_name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const campaignAccounts = pgTable(
  "campaign_accounts",
  {
    campaignId: uuid("campaign_id")
      .references(() => campaigns.id, { onDelete: "cascade" })
      .notNull(),
    accountId: uuid("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    autopilot: boolean("autopilot").default(false),
  },
  (t) => ({
    // composite index works as a uniqueness guard for a pair
    pk: index("campaign_accounts_idx").on(t.campaignId, t.accountId),
  }),
)

import { z } from "zod"

export const CampaignStatusEnum = z.enum(["draft", "active", "paused", "completed"])
export const LeadStatusEnum = z.enum(["pending", "contacted", "responded", "converted", "do_not_contact"])
export const UUID = z.string().uuid()
export const Cursor = z.string().optional() // base64 "createdAt:id" or similar

// ── Leads ────────────────────────────────────────────────────────────────
export const LeadsListQuerySchema = z.object({
  cursor: Cursor,
  q: z.string().trim().optional(),
  status: z
    .union([LeadStatusEnum, z.array(LeadStatusEnum)])
    .optional()
    .transform((v) => (typeof v === "string" ? [v] : v)),
  campaignId: UUID.optional(),
  sort: z.enum(["recent", "name_asc", "name_desc", "last_contact_desc"]).default("recent").optional(),
})

export const LeadPatchSchema = z.object({
  status: LeadStatusEnum,
})

export const InteractionCreateSchema = z.object({
  type: z.enum([
    "invitation_request",
    "connection_status",
    "acceptance_msg",
    "followup_1",
    "followup_2",
    "replied",
    "note",
  ]),
  message: z.string().trim().min(1).max(2000),
})

// ── Campaigns ────────────────────────────────────────────────────────────
export const CampaignListQuerySchema = z.object({
  status: z
    .union([CampaignStatusEnum, z.array(CampaignStatusEnum)])
    .optional()
    .transform((v) => (typeof v === "string" ? [v] : v)),
  sort: z.enum(["name_asc", "name_desc", "created_desc", "response_desc"]).optional(),
})

export const CampaignPatchSchema = z.object({
  name: z.string().trim().min(1).max(180).optional(),
  status: CampaignStatusEnum.optional(),
})

export const TemplatesPatchSchema = z.object({
  requestMessage: z.string().trim().max(4000).optional(),
  connectionMessage: z.string().trim().max(4000).optional(),
  followup1: z.string().trim().max(4000).optional(),
  followup1DelayDays: z.number().int().min(0).max(30).optional(),
  followup2: z.string().trim().max(4000).optional(),
  followup2DelayDays: z.number().int().min(0).max(30).optional(),
})

export const SettingsPatchSchema = z.object({
  name: z.string().trim().min(1).max(180).optional(),
  status: CampaignStatusEnum.optional(),
  requestWithoutPersonalization: z.boolean().optional(),
  autopilot: z.boolean().optional(),
  accountIds: z.array(UUID).optional(),
})

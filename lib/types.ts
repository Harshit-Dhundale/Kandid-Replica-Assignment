// Shared types for the application

export type LeadStatus = "pending" | "contacted" | "responded" | "converted" | "do_not_contact";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export interface Lead {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  status: LeadStatus;
  lastContactAt?: string | null;
  createdAt: string;
  campaignId: string;
  avatar?: string;
  activity?: number; // 0 to 4 bars
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  createdAt: string;
  startDate?: string | null;
  createdBy: string;
  archived?: boolean;
}

export interface CampaignStats {
  campaignId: string;
  totalLeads: number;
  requestSent: number;
  requestAccepted: number;
  requestReplied: number;
  metrics: {
    contactedRate: number;
    acceptanceRate: number;
    replyRate: number;
    conversionRate: number;
  };
}

export interface LeadInteraction {
  id: number;
  leadId: string;
  type: "invitation_request" | "connection_status" | "acceptance_msg" | "followup_1" | "followup_2" | "replied" | "note";
  message?: string;
  createdAt: string;
}


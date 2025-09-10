CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'active', 'paused', 'completed');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('pending', 'contacted', 'responded', 'converted', 'do_not_contact');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text DEFAULT 'linkedin' NOT NULL,
	"display_name" text NOT NULL,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_accounts" (
	"campaign_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"autopilot" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"status" "campaign_status" DEFAULT 'active' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"start_date" timestamp with time zone,
	"archived" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "lead_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" uuid NOT NULL,
	"type" text NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text,
	"company" text,
	"job_title" text,
	"campaign_id" uuid NOT NULL,
	"status" "lead_status" DEFAULT 'pending' NOT NULL,
	"last_contact_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" uuid NOT NULL,
	"request_message" text,
	"connection_message" text,
	"followup_1" text,
	"followup_1_delay_days" integer DEFAULT 1,
	"followup_2" text,
	"followup_2_delay_days" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaign_accounts" ADD CONSTRAINT "campaign_accounts_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_accounts" ADD CONSTRAINT "campaign_accounts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_interactions" ADD CONSTRAINT "lead_interactions_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campaign_accounts_idx" ON "campaign_accounts" USING btree ("campaign_id","account_id");--> statement-breakpoint
CREATE INDEX "campaigns_created_idx" ON "campaigns" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "campaigns_status_idx" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_campaign_idx" ON "leads" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_last_contact_idx" ON "leads" USING btree ("last_contact_at");
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, leadInteractions, campaigns } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { LeadPatchSchema } from "@/lib/zod";
import { auth } from "@/lib/auth";

// GET /api/leads/[id]
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: leadId } = await ctx.params;

    // Lead details
    const [lead] = await db
      .select({
        id: leads.id,
        fullName: leads.fullName,
        firstName: leads.firstName,
        lastName: leads.lastName,
        email: leads.email,
        company: leads.company,
        jobTitle: leads.jobTitle,
        status: leads.status,
        lastContactAt: leads.lastContactAt,
        createdAt: leads.createdAt,
        campaignName: campaigns.name,
        campaignId: leads.campaignId,
      })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(eq(leads.id, leadId));

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Interactions (latest first)
    const interactions = await db
      .select()
      .from(leadInteractions)
      .where(eq(leadInteractions.leadId, leadId))
      .orderBy(desc(leadInteractions.createdAt));

    return NextResponse.json({
      ...lead,
      createdAt: lead.createdAt.toISOString(),
      lastContactAt: lead.lastContactAt?.toISOString() ?? null,
      interactions: interactions.map((i) => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/leads/[id]
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: leadId } = await ctx.params;
    const body = await req.json();
    const parsed = LeadPatchSchema.parse(body);

    const [updatedLead] = await db
      .update(leads)
      .set({
        status: parsed.status,
        lastContactAt: new Date(),
      })
      .where(eq(leads.id, leadId))
      .returning();

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...updatedLead,
      createdAt: updatedLead.createdAt.toISOString(),
      lastContactAt: updatedLead.lastContactAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

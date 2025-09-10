import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { CampaignPatchSchema } from "@/lib/zod";
import { auth } from "@/lib/auth";

// GET /api/campaigns/[id]
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await ctx.params;

    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId));
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...campaign,
      createdAt: campaign.createdAt.toISOString(),
      startDate: campaign.startDate?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/campaigns/[id]
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await ctx.params;
    const body = await req.json();
    const parsed = CampaignPatchSchema.parse(body);

    const [updatedCampaign] = await db
      .update(campaigns)
      .set({
        ...(parsed.name && { name: parsed.name }),
        ...(parsed.status && { status: parsed.status }),
      })
      .where(eq(campaigns.id, campaignId))
      .returning();

    if (!updatedCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...updatedCampaign,
      createdAt: updatedCampaign.createdAt.toISOString(),
      startDate: updatedCampaign.startDate?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/campaigns/[id]
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await ctx.params;

    const [deletedCampaign] = await db.delete(campaigns).where(eq(campaigns.id, campaignId)).returning();
    if (!deletedCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

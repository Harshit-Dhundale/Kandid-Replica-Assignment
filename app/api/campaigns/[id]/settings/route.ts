import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, accounts, campaignAccounts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { SettingsPatchSchema } from "@/lib/zod";
import { auth } from "@/lib/auth";

// Common UUID validator
const isValidUUID = (id: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await params;

    // ✅ Validate UUID before querying DB
    if (!isValidUUID(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });
    }

    // ✅ Fetch campaign
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId));

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // ✅ Fetch associated accounts
    const associatedAccounts = await db
      .select({
        accountId: accounts.id,
        displayName: accounts.displayName,
        email: accounts.email,
        autopilot: campaignAccounts.autopilot,
      })
      .from(campaignAccounts)
      .innerJoin(accounts, eq(campaignAccounts.accountId, accounts.id))
      .where(eq(campaignAccounts.campaignId, campaignId));

    // ✅ Fetch all user-owned accounts
    let allAccounts: { id: string; displayName: string; email: string | null; }[] = [];

if (isValidUUID(session.user.id)) {
  allAccounts = await db
    .select({
      id: accounts.id,
      displayName: accounts.displayName,
      email: accounts.email,
    })
    .from(accounts)
    .where(eq(accounts.userId, session.user.id));
}

    return NextResponse.json({
      name: campaign.name,
      status: campaign.status,
      requestWithoutPersonalization: false, // For future use
      autopilot: associatedAccounts.some((acc) => acc.autopilot),
      associatedAccounts,
      availableAccounts: allAccounts,
    });
  } catch (error) {
    console.error("Error fetching campaign settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await params;

    // ✅ Validate UUID in PATCH too
    if (!isValidUUID(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = SettingsPatchSchema.parse(body);

    // ✅ Update campaign name or status
    if (parsed.name || parsed.status) {
      await db
        .update(campaigns)
        .set({
          ...(parsed.name && { name: parsed.name }),
          ...(parsed.status && { status: parsed.status }),
        })
        .where(eq(campaigns.id, campaignId));
    }

    // ✅ Update account associations if provided
    if (parsed.accountIds) {
      await db.delete(campaignAccounts).where(eq(campaignAccounts.campaignId, campaignId));

      if (parsed.accountIds.length > 0) {
        await db.insert(campaignAccounts).values(
          parsed.accountIds.map((accountId) => ({
            campaignId,
            accountId,
            autopilot: parsed.autopilot || false,
          }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating campaign settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

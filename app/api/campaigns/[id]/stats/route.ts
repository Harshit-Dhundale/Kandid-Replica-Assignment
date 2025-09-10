import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, leadInteractions } from "@/drizzle/schema";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

// GET /api/campaigns/[id]/stats
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

    // Total leads for campaign
    const [{ total }] = (
      await db.execute<{ total: number }>(
        sql`SELECT COUNT(*)::int AS total FROM ${leads} WHERE ${leads.campaignId} = ${campaignId}`
      )
    ).rows;

    // Distinct lead counts by interaction type
    const distinctByType = await db.execute<{ type: string; count: number }>(sql`
      SELECT type, COUNT(DISTINCT lead_id)::int AS count
      FROM ${leadInteractions}
      WHERE lead_id IN (SELECT id FROM ${leads} WHERE ${leads.campaignId} = ${campaignId})
      GROUP BY type
    `);

    const countFor = (t: string) => distinctByType.rows.find((r) => r.type === t)?.count ?? 0;

    const requestSent = countFor("invitation_request");
    const requestAccepted = countFor("acceptance_msg");

    // Replies (from interactions)
    const [{ repliedFromInteractions = 0 }] = (
      await db.execute<{ repliedFromInteractions: number }>(sql`
        SELECT COUNT(DISTINCT lead_id)::int AS replied_from_interactions
        FROM ${leadInteractions}
        WHERE type = 'replied'
          AND lead_id IN (SELECT id FROM ${leads} WHERE ${leads.campaignId} = ${campaignId})
      `)
    ).rows;

    // Replies (from lead status)
    const [{ repliedFromStatus = 0 }] = (
      await db.execute<{ repliedFromStatus: number }>(sql`
        SELECT COUNT(*)::int AS replied_from_status
        FROM ${leads}
        WHERE ${leads.campaignId} = ${campaignId}
          AND ${leads.status} IN ('responded','converted')
      `)
    ).rows;

    const requestReplied = Math.max(repliedFromInteractions, repliedFromStatus);

    // Converted
    const [{ converted = 0 }] = (
      await db.execute<{ converted: number }>(sql`
        SELECT COUNT(*)::int AS converted
        FROM ${leads}
        WHERE ${leads.campaignId} = ${campaignId} AND ${leads.status} = 'converted'
      `)
    ).rows;

    const contacted = requestSent;

    const pct = (num: number, den: number) =>
      den > 0 ? Math.round((num / den) * 1000) / 10 : 0; // 1 decimal

    const acceptanceRate = pct(requestAccepted, requestSent);
    const replyRate = pct(requestReplied, requestSent);
    const contactedRate = pct(contacted, total);
    const conversionRate = pct(converted, total);

    return NextResponse.json({
      campaignId,
      totalLeads: total,
      requestSent,
      requestAccepted,
      requestReplied,
      metrics: {
        contactedRate,
        acceptanceRate,
        replyRate,
        conversionRate,
      },
    });
  } catch (error) {
    console.error("Error fetching campaign stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

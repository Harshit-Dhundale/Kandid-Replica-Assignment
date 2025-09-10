import { db } from "@/lib/db";
import { leads } from "@/drizzle/schema";
import { eq, desc, and, lt, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Base64url(JSON) cursor to avoid timestamp parsing pitfalls
function encodeCursor(ts: Date, id: string) {
  const payload = { ts: ts.toISOString(), id };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursor(raw: string | null) {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const obj = JSON.parse(json) as { ts: string; id: string };
    const date = new Date(obj.ts);
    if (Number.isNaN(date.getTime()) || typeof obj.id !== "string") return null;
    return { ts: date, id: obj.id };
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Add authentication
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await params;

    // Validate UUID early
    if (!/^[0-9a-fA-F-]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100); // Max 100 per page

    // Cursor keyset on (createdAt, id)
    const cursorData = decodeCursor(cursor);
    const whereConditions = [eq(leads.campaignId, campaignId)];
    
    if (cursorData) {
      whereConditions.push(
        or(
          lt(leads.createdAt, cursorData.ts),
          and(eq(leads.createdAt, cursorData.ts), lt(leads.id, cursorData.id))
        )!
      );
    }

    // Fetch leads for this campaign with pagination
    const campaignLeads = await db
      .select()
      .from(leads)
      .where(and(...whereConditions))
      .orderBy(desc(leads.createdAt), desc(leads.id))
      .limit(limit + 1); // Fetch one extra to check if there are more

    const hasMore = campaignLeads.length > limit;
    const items = hasMore ? campaignLeads.slice(0, -1) : campaignLeads;

    const nextCursor =
      hasMore && items.length
        ? encodeCursor(new Date(items[items.length - 1].createdAt), items[items.length - 1].id)
        : undefined;

    return NextResponse.json({ 
      leads: items.map(lead => ({
        ...lead,
        createdAt: lead.createdAt.toISOString(),
        lastContactAt: lead.lastContactAt?.toISOString() ?? null,
      })),
      nextCursor,
      hasMore 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching campaign leads:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

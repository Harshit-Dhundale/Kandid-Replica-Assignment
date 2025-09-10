import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, campaigns } from "@/drizzle/schema";
import { sql, and, eq, inArray, desc, asc, lt, or } from "drizzle-orm";
import { LeadsListQuerySchema } from "@/lib/zod";
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

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = LeadsListQuerySchema.parse({
      cursor: searchParams.get("cursor") || undefined,
      q: searchParams.get("q") || undefined,
      status: searchParams.getAll("status"),
      campaignId: searchParams.get("campaignId") || undefined,
      sort: searchParams.get("sort") || "recent",
    });

    const limit = 20;
    const whereConditions: any[] = [];

    // Search filter
    if (parsed.q) {
      const like = `%${parsed.q}%`;
      whereConditions.push(
        sql`(${leads.fullName} ILIKE ${like} OR ${leads.email} ILIKE ${like} OR ${leads.company} ILIKE ${like})`,
      );
    }

    // Status filter (enum-safe)
    if (parsed.status && parsed.status.length > 0) {
      // @ts-ignore drizzle enum narrowing is fine at runtime
      whereConditions.push(inArray(leads.status, parsed.status));
    }

    // Campaign filter
    if (parsed.campaignId) {
      whereConditions.push(eq(leads.campaignId, parsed.campaignId));
    }

    // Cursor keyset on (createdAt, id)
    const cursor = decodeCursor(parsed.cursor ?? null);
    if (cursor) {
      whereConditions.push(
        or(
          lt(leads.createdAt, cursor.ts),
          and(eq(leads.createdAt, cursor.ts), lt(leads.id, cursor.id)),
        ),
      );
    }

    // Build base (no limit/order yet so typing stays happy)
    const base = db
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
      })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    // Apply ordering first, then limit (avoids builder type narrowing issues)
    const ordered =
      parsed.sort === "name_asc"
        ? base.orderBy(asc(leads.fullName), desc(leads.createdAt), desc(leads.id))
        : parsed.sort === "name_desc"
        ? base.orderBy(desc(leads.fullName), desc(leads.createdAt), desc(leads.id))
        : parsed.sort === "last_contact_desc"
        ? base.orderBy(
            desc(sql`COALESCE(${leads.lastContactAt}, ${leads.createdAt})`),
            desc(leads.id),
          )
        : // recent (default)
          base.orderBy(desc(leads.createdAt), desc(leads.id));

    const results = await ordered.limit(limit + 1);

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, -1) : results;

    const nextCursor =
      hasMore && items.length
        ? encodeCursor(new Date(items[items.length - 1].createdAt), items[items.length - 1].id)
        : undefined;

    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        lastContactAt: item.lastContactAt?.toISOString() ?? null,
      })),
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

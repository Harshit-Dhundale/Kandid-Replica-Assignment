// app/api/campaigns/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql, type SQL } from "drizzle-orm";
import { auth } from "@/lib/auth";

/**
 * Returns aggregated campaign rows with metrics:
 * - totalLeads
 * - requestSent: distinct leads with 'invitation_request'
 * - requestAccepted: distinct leads with 'acceptance_msg'
 * - requestReplied: distinct leads with 'replied'
 */
export async function GET(req: NextRequest) {
  try {
    // auth gate
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const statusParams = searchParams.getAll("status").filter(Boolean);
    const sort = (searchParams.get("sort") || "created_desc").toLowerCase();

    // --- WHERE (parameterized via drizzle sql template) ---
    const whereClauses: SQL[] = [];

    if (q) {
      whereClauses.push(sql`c.name ILIKE ${`%${q}%`}`);
    }

    if (statusParams.length === 1) {
      whereClauses.push(sql`c.status = ${statusParams[0]}`);
    } else if (statusParams.length > 1) {
      // IN ($1, $2, ...)
      const list = sql.join(statusParams.map((s) => sql`${s}`), sql`, `);
      whereClauses.push(sql`c.status IN (${list})`);
    }

    const whereSQL =
      whereClauses.length > 0 ? sql`WHERE ${sql.join(whereClauses, sql` AND `)}` : sql``;

    // --- ORDER BY (whitelisted to avoid injection) ---
    const orderBy =
      sort === "name_asc"
        ? "c.name ASC"
        : sort === "name_desc"
        ? "c.name DESC"
        : sort === "response_desc"
        ? "request_replied DESC, c.created_at DESC"
        : "c.created_at DESC"; // default

    // --- Query ---
    const stmt = sql`
      SELECT
        c.id,
        c.name,
        c.status,
        c.created_at,
        COUNT(l.id)::int AS total_leads,
        COUNT(DISTINCT li.lead_id) FILTER (WHERE li.type = 'invitation_request')::int AS request_sent,
        COUNT(DISTINCT li.lead_id) FILTER (WHERE li.type = 'acceptance_msg')::int      AS request_accepted,
        COUNT(DISTINCT li.lead_id) FILTER (WHERE li.type = 'replied')::int             AS request_replied
      FROM campaigns c
      LEFT JOIN leads l ON l.campaign_id = c.id
      LEFT JOIN lead_interactions li ON li.lead_id = l.id
      ${whereSQL}
      GROUP BY c.id
      ORDER BY ${sql.raw(orderBy)}
      LIMIT 100
    `;

    const { rows } = await db.execute<{
      id: string;
      name: string;
      status: "draft" | "active" | "paused" | "completed";
      created_at: Date;
      total_leads: number;
      request_sent: number;
      request_accepted: number;
      request_replied: number;
    }>(stmt);

    const items = rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      createdAt: new Date(r.created_at).toISOString(),
      totalLeads: r.total_leads,
      requestSent: r.request_sent,
      requestAccepted: r.request_accepted,
      requestReplied: r.request_replied,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { messageTemplates } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { TemplatesPatchSchema } from "@/lib/zod"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: campaignId } = await params;
 // Validate UUID early
  if (!/^[0-9a-fA-F-]{36}$/.test(campaignId)) {
    return new Response(JSON.stringify({ error: "Invalid campaign ID" }), { status: 400 });
  }


    const [template] = await db.select().from(messageTemplates).where(eq(messageTemplates.campaignId, campaignId))

    if (!template) {
      // Return empty template structure
      return NextResponse.json({
        requestMessage: "",
        connectionMessage: "",
        followup1: "",
        followup1DelayDays: 1,
        followup2: "",
        followup2DelayDays: 1,
      })
    }

    return NextResponse.json({
      requestMessage: template.requestMessage || "",
      connectionMessage: template.connectionMessage || "",
      followup1: template.followup1 || "",
      followup1DelayDays: template.followup1DelayDays || 1,
      followup2: template.followup2 || "",
      followup2DelayDays: template.followup2DelayDays || 1,
    })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: campaignId } = await params;

    const body = await req.json()
    const parsed = TemplatesPatchSchema.parse(body)

    // Check if template exists
    const [existingTemplate] = await db
      .select()
      .from(messageTemplates)
      .where(eq(messageTemplates.campaignId, campaignId))

    if (existingTemplate) {
      // Update existing template
      const [updatedTemplate] = await db
        .update(messageTemplates)
        .set({
          ...(parsed.requestMessage !== undefined && { requestMessage: parsed.requestMessage }),
          ...(parsed.connectionMessage !== undefined && { connectionMessage: parsed.connectionMessage }),
          ...(parsed.followup1 !== undefined && { followup1: parsed.followup1 }),
          ...(parsed.followup1DelayDays !== undefined && { followup1DelayDays: parsed.followup1DelayDays }),
          ...(parsed.followup2 !== undefined && { followup2: parsed.followup2 }),
          ...(parsed.followup2DelayDays !== undefined && { followup2DelayDays: parsed.followup2DelayDays }),
        })
        .where(eq(messageTemplates.campaignId, campaignId))
        .returning()

      return NextResponse.json(updatedTemplate)
    } else {
      // Create new template
      const [newTemplate] = await db
        .insert(messageTemplates)
        .values({
          campaignId,
          requestMessage: parsed.requestMessage || "",
          connectionMessage: parsed.connectionMessage || "",
          followup1: parsed.followup1 || "",
          followup1DelayDays: parsed.followup1DelayDays || 1,
          followup2: parsed.followup2 || "",
          followup2DelayDays: parsed.followup2DelayDays || 1,
        })
        .returning()

      return NextResponse.json(newTemplate)
    }
  } catch (error) {
    console.error("Error updating templates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

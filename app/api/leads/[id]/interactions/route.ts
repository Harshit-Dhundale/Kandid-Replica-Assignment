import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { leadInteractions } from "@/drizzle/schema"
import { eq, desc } from "drizzle-orm"
import { InteractionCreateSchema } from "@/lib/zod"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: leadId } = await params

    const interactions = await db
      .select()
      .from(leadInteractions)
      .where(eq(leadInteractions.leadId, leadId))
      .orderBy(desc(leadInteractions.createdAt))

    return NextResponse.json({
      items: interactions.map((interaction) => ({
        ...interaction,
        createdAt: interaction.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching interactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: leadId } = await params
    const body = await req.json()
    const parsed = InteractionCreateSchema.parse(body)

    const [interaction] = await db
      .insert(leadInteractions)
      .values({
        leadId,
        type: parsed.type,
        message: parsed.message,
      })
      .returning()

    return NextResponse.json({
      ...interaction,
      createdAt: interaction.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Error creating interaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

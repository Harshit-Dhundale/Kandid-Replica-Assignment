import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { accounts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, session.user.id));

    // For now, return mock data since we don't have real LinkedIn account integration
    const mockAccounts = [
      {
        id: "1",
        userId: session.user.id,
        type: "linkedin",
        displayName: "Pulkit Garg",
        email: "1999pulkitgarg@gmail.com",
        createdAt: new Date().toISOString(),
        requestsUsed: 17,
        requestsLimit: 30,
        status: "connected",
      },
      {
        id: "2",
        userId: session.user.id,
        type: "linkedin", 
        displayName: "Jivesh Lakhani",
        email: "jivesh@example.com",
        createdAt: new Date().toISOString(),
        requestsUsed: 19,
        requestsLimit: 30,
        status: "connected",
      },
      {
        id: "3",
        userId: session.user.id,
        type: "linkedin",
        displayName: "Indrajit Sahani",
        email: "indrajit@example.com", 
        createdAt: new Date().toISOString(),
        requestsUsed: 18,
        requestsLimit: 30,
        status: "connected",
      },
      {
        id: "4",
        userId: session.user.id,
        type: "linkedin",
        displayName: "Bhavya Arora",
        email: "bhavya@example.com",
        createdAt: new Date().toISOString(),
        requestsUsed: 18,
        requestsLimit: 100,
        status: "connected",
      },
    ];

    return NextResponse.json({ items: mockAccounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// app/api/auth/[...all]/route.ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// IMPORTANT: pass the handler
export const { GET, POST } = toNextJsHandler(auth.handler);

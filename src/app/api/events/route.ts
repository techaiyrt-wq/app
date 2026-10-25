import { db } from "@/db";
import { events } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(events)
    .orderBy(desc(events.createdAt))
    .limit(20);
  return Response.json(rows);
}
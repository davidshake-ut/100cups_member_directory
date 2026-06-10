import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.select({ count: sql<number>`count(*)` }).from(users);
    return NextResponse.json({ status: "ok", db: "connected" });
  } catch (err) {
    return NextResponse.json(
      { status: "error", db: "failed", message: String(err) },
      { status: 500 }
    );
  }
}

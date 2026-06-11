import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { profiles, users } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};

  try {
    await db.select({ count: sql<number>`count(*)` }).from(users);
    checks.db = "ok";
  } catch (err) {
    return NextResponse.json(
      { status: "error", checks, message: String(err) },
      { status: 500 }
    );
  }

  try {
    await db.select({ photoData: profiles.photoData }).from(profiles).limit(1);
    checks.photo_data_column = "ok";
  } catch (err) {
    checks.photo_data_column = String(err);
  }

  const allOk = Object.values(checks).every((v) => v === "ok");
  return NextResponse.json(
    { status: allOk ? "ok" : "degraded", checks },
    { status: allOk ? 200 : 500 }
  );
}

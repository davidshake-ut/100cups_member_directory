import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { users } from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const isNew = searchParams.get("new") === "1";

  const store = await cookies();

  if (isNew) {
    const [newUser] = await db
      .insert(users)
      .values({ email: `guest_${randomBytes(8).toString("hex")}@local` })
      .returning();
    store.set("profile_user_id", newUser.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } else if (userId) {
    store.set("profile_user_id", userId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  redirect("/profile");
}

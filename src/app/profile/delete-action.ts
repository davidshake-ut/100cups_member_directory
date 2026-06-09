"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { profiles, users } from "@/db/schema";
import { deletePhoto } from "@/lib/r2";

export async function deleteProfileAction(formData: FormData) {
  const confirm = String(formData.get("confirm") ?? "");
  if (confirm !== "DELETE") {
    redirect("/profile?deleteError=1");
  }

  const store = await cookies();
  const userId = store.get("profile_user_id")?.value;
  if (!userId) redirect("/profile");

  // Best-effort R2 photo cleanup before deleting the row
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  if (existing?.photoKey) {
    try {
      await deletePhoto(existing.photoKey);
    } catch {
      // swallow — don't block deletion if R2 is unreachable
    }
  }

  // Deleting the user cascades to profiles, accounts, sessions
  await db.delete(users).where(eq(users.id, userId));

  store.delete("profile_user_id");
  redirect("/directory");
}

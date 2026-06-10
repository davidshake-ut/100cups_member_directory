import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const isNew = searchParams.get("new") === "1";

  const store = await cookies();

  if (isNew) {
    store.delete("profile_user_id");
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

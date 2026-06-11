import Link from "next/link";
import { eq, isNotNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { profiles, users } from "@/db/schema";
import { SiteHeader } from "@/components/site-header";
import { DirectoryGrid, type DirectoryEntry } from "./directory-grid";

export const dynamic = "force-dynamic";

function initialsFromText(text: string): string {
  const parts = text.split(/[\s@.]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase() || text[0]?.toUpperCase() || "?";
}

export default async function DirectoryPage() {
  const store = await cookies();
  const currentUserId = store.get("profile_user_id")?.value ?? null;

  const rows = await db
    .select({
      user: { id: users.id, name: users.name, email: users.email },
      profile: profiles,
    })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(isNotNull(profiles.displayName))
    .orderBy(users.email);

  const entries: DirectoryEntry[] = rows.map((row) => {
    const displayName =
      row.profile?.displayName?.trim() ||
      row.user.name?.trim() ||
      row.user.email.split("@")[0];
    const initialsSource =
      row.profile?.displayName?.trim() ||
      row.user.name?.trim() ||
      row.user.email;
    return {
      id: row.user.id,
      isSelf: row.user.id === currentUserId,
      photoUrl: row.profile?.photoData ?? null,
      displayName,
      initials: initialsFromText(initialsSource),
      headline: row.profile?.headline ?? null,
      company: row.profile?.company ?? null,
      city: row.profile?.city ?? null,
      bio: row.profile?.bio ?? null,
      whatIDo: row.profile?.whatIDo ?? null,
      idealClient: row.profile?.idealClient ?? null,
      linkedinUrl: row.profile?.linkedinUrl ?? null,
      websiteUrl: row.profile?.websiteUrl ?? null,
      calendarUrl: row.profile?.calendarUrl ?? null,
      searchHaystack: [
        displayName,
        row.profile?.headline,
        row.profile?.company,
        row.profile?.city,
        row.profile?.bio,
        row.profile?.whatIDo,
        row.profile?.idealClient,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    };
  });

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-accent">
            The directory
          </p>
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            Who&apos;s in the room.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Browse, search by what someone does or is looking for, then ask the
            group for an intro.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <DirectoryGrid entries={entries} />

          <p className="mt-12 text-sm text-muted">
            <Link href="/profile" className="text-accent hover:text-accent-hover">
              Edit your own profile →
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

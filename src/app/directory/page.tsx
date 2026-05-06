import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { profiles, users } from "@/db/schema";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

type MemberRow = {
  user: { id: string; name: string | null; email: string };
  profile: typeof profiles.$inferSelect | null;
};

function initialsFor(row: MemberRow): string {
  const source =
    row.profile?.displayName?.trim() ||
    row.user.name?.trim() ||
    row.user.email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase() || source[0]?.toUpperCase() || "?";
}

function displayNameFor(row: MemberRow): string {
  return (
    row.profile?.displayName?.trim() ||
    row.user.name?.trim() ||
    row.user.email.split("@")[0]
  );
}

function MemberCard({ row, isSelf }: { row: MemberRow; isSelf: boolean }) {
  const { profile } = row;
  const hasAnyProfile =
    profile &&
    [
      profile.headline,
      profile.bio,
      profile.whatIDo,
      profile.idealClient,
      profile.company,
      profile.city,
      profile.linkedinUrl,
      profile.websiteUrl,
    ].some((v) => v?.trim());

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-accent/40">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-accent/15 font-display text-lg text-accent">
          {initialsFor(row)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl tracking-tight">
            {displayNameFor(row)}
            {isSelf ? (
              <span className="ml-2 align-middle text-xs font-normal text-muted">
                (you)
              </span>
            ) : null}
          </h2>
          {profile?.headline ? (
            <p className="mt-1 text-sm text-muted">{profile.headline}</p>
          ) : null}
          {profile?.company || profile?.city ? (
            <p className="mt-1 text-xs text-muted">
              {[profile.company, profile.city].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      {profile?.bio ? (
        <p className="mt-5 text-sm leading-relaxed">{profile.bio}</p>
      ) : null}

      {profile?.whatIDo ? (
        <div className="mt-5 border-t border-border/60 pt-4">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            What I do
          </p>
          <p className="mt-2 text-sm leading-relaxed">{profile.whatIDo}</p>
        </div>
      ) : null}

      {profile?.idealClient ? (
        <div className="mt-4 border-t border-border/60 pt-4">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            Looking for intros to
          </p>
          <p className="mt-2 text-sm leading-relaxed">{profile.idealClient}</p>
        </div>
      ) : null}

      {profile?.linkedinUrl || profile?.websiteUrl ? (
        <div className="mt-5 flex gap-3 text-sm">
          {profile.linkedinUrl ? (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:text-accent-hover"
            >
              LinkedIn ↗
            </a>
          ) : null}
          {profile.websiteUrl ? (
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:text-accent-hover"
            >
              Website ↗
            </a>
          ) : null}
        </div>
      ) : null}

      {!hasAnyProfile ? (
        <p className="mt-5 text-sm italic text-muted">
          {isSelf
            ? "You haven't filled in your profile yet."
            : "Hasn't added profile details yet."}
        </p>
      ) : null}
    </article>
  );
}

export default async function DirectoryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  const rows = await db
    .select({
      user: { id: users.id, name: users.name, email: users.email },
      profile: profiles,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .orderBy(users.email);

  const currentUserId = session.user.id;

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
            {rows.length} {rows.length === 1 ? "member" : "members"}. Browse,
            then ask the group for an intro to anyone you&apos;d like to talk
            to.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          {rows.length === 0 ? (
            <p className="text-muted">No members yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => (
                <MemberCard
                  key={row.user.id}
                  row={row}
                  isSelf={row.user.id === currentUserId}
                />
              ))}
            </div>
          )}

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

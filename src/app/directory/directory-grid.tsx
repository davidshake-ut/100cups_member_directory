"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { Pencil, PlusCircle } from "lucide-react";

export type DirectoryEntry = {
  id: string;
  isSelf: boolean;
  photoUrl: string | null;
  displayName: string;
  initials: string;
  headline: string | null;
  company: string | null;
  city: string | null;
  bio: string | null;
  whatIDo: string | null;
  idealClient: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  calendarUrl: string | null;
  searchHaystack: string;
};

function MemberCard({ entry }: { entry: DirectoryEntry }) {
  const hasAnyProfile =
    !!entry.headline ||
    !!entry.bio ||
    !!entry.whatIDo ||
    !!entry.idealClient ||
    !!entry.company ||
    !!entry.city ||
    !!entry.linkedinUrl ||
    !!entry.websiteUrl ||
    !!entry.calendarUrl;

  return (
    <article className="group relative rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-accent/40">
      <Link
        href={`/api/profile-context?userId=${entry.id}`}
        title="Edit profile"
        className="absolute right-4 top-4 rounded-full p-1.5 text-muted opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
      >
        <Pencil size={14} />
        <span className="sr-only">Edit {entry.displayName}&apos;s profile</span>
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-full bg-accent/15 font-display text-lg text-accent">
          {entry.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.photoUrl}
              alt={`${entry.displayName} profile photo`}
              className="h-full w-full object-cover"
            />
          ) : (
            entry.initials
          )}
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <h2 className="font-display text-xl tracking-tight">
            {entry.displayName}
          </h2>
          {entry.headline ? (
            <p className="mt-1 text-sm text-muted">{entry.headline}</p>
          ) : null}
          {entry.company || entry.city ? (
            <p className="mt-1 text-xs text-muted">
              {[entry.company, entry.city].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      {entry.bio ? (
        <p className="mt-5 text-sm leading-relaxed">{entry.bio}</p>
      ) : null}

      {entry.whatIDo ? (
        <div className="mt-5 border-t border-border/60 pt-4">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            What I do
          </p>
          <p className="mt-2 text-sm leading-relaxed">{entry.whatIDo}</p>
        </div>
      ) : null}

      {entry.idealClient ? (
        <div className="mt-4 border-t border-border/60 pt-4">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            Looking for intros to
          </p>
          <p className="mt-2 text-sm leading-relaxed">{entry.idealClient}</p>
        </div>
      ) : null}

      {entry.linkedinUrl || entry.websiteUrl || entry.calendarUrl ? (
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {entry.calendarUrl ? (
            <a
              href={entry.calendarUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:text-accent-hover"
            >
              Book a call ↗
            </a>
          ) : null}
          {entry.linkedinUrl ? (
            <a
              href={entry.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:text-accent-hover"
            >
              LinkedIn ↗
            </a>
          ) : null}
          {entry.websiteUrl ? (
            <a
              href={entry.websiteUrl}
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
          Hasn&apos;t added profile details yet.
        </p>
      ) : null}
    </article>
  );
}

export function DirectoryGrid({ entries }: { entries: DirectoryEntry[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) => entry.searchHaystack.includes(q));
  }, [entries, deferredQuery]);

  return (
    <>
      <div className="mb-8 flex items-center gap-3">
        <label className="block flex-1">
          <span className="sr-only">Search the directory</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, company, city, what they do…"
            className="h-12 w-full rounded-full border border-border bg-card px-5 text-base outline-none focus:border-accent"
          />
        </label>
        <Link
          href="/api/profile-context?new=1"
          title="Add your profile"
          className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-border bg-card text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <PlusCircle size={20} />
          <span className="sr-only">Add your profile</span>
        </Link>
      </div>

      <p className="mb-6 text-xs text-muted">
        {filtered.length === entries.length
          ? `${entries.length} ${entries.length === 1 ? "member" : "members"}`
          : `${filtered.length} of ${entries.length} ${entries.length === 1 ? "member" : "members"}`}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border/70 bg-card p-6 text-sm text-muted">
          No members match &ldquo;{deferredQuery}&rdquo;.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <MemberCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

const FIELD_LIMITS = {
  displayName: 80,
  headline: 120,
  company: 80,
  city: 80,
  bio: 1000,
  whatIDo: 1000,
  idealClient: 1000,
  linkedinUrl: 256,
  websiteUrl: 256,
} as const;

type FieldKey = keyof typeof FIELD_LIMITS;

function readField(formData: FormData, key: FieldKey): string | null {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().slice(0, FIELD_LIMITS[key]);
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeUrl(value: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

async function saveProfile(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const values = {
    userId: session.user.id,
    displayName: readField(formData, "displayName"),
    headline: readField(formData, "headline"),
    company: readField(formData, "company"),
    city: readField(formData, "city"),
    bio: readField(formData, "bio"),
    whatIDo: readField(formData, "whatIDo"),
    idealClient: readField(formData, "idealClient"),
    linkedinUrl: normalizeUrl(readField(formData, "linkedinUrl")),
    websiteUrl: normalizeUrl(readField(formData, "websiteUrl")),
    updatedAt: new Date(),
  };

  await db
    .insert(profiles)
    .values(values)
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        displayName: values.displayName,
        headline: values.headline,
        company: values.company,
        city: values.city,
        bio: values.bio,
        whatIDo: values.whatIDo,
        idealClient: values.idealClient,
        linkedinUrl: values.linkedinUrl,
        websiteUrl: values.websiteUrl,
        updatedAt: values.updatedAt,
      },
    });

  revalidatePath("/profile");
  revalidatePath("/directory");
  redirect("/profile?saved=1");
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  hint,
  textarea,
  rows,
}: {
  label: string;
  name: FieldKey;
  defaultValue: string | null;
  type?: string;
  hint?: string;
  textarea?: boolean;
  rows?: number;
}) {
  const limit = FIELD_LIMITS[name];
  const baseClasses =
    "rounded-2xl border border-border bg-card px-5 py-3 text-base outline-none focus:border-accent";
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">
        {label}
        {hint ? (
          <span className="ml-2 text-xs font-normal text-muted">{hint}</span>
        ) : null}
      </span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue ?? ""}
          maxLength={limit}
          rows={rows ?? 4}
          className={`${baseClasses} resize-y leading-relaxed`}
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue ?? ""}
          maxLength={limit}
          className={`${baseClasses} h-12`}
        />
      )}
    </label>
  );
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }
  const { saved } = await searchParams;

  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-6 pt-16 pb-24">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.2em] text-accent">
              Your profile
            </p>
            <Link
              href="/directory"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              ← Back to directory
            </Link>
          </div>

          <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            Tell the room about you.
          </h1>
          <p className="mt-4 text-muted">
            Members will see what you do and the kind of intros you&apos;d
            love. Leave any field blank to keep it private.
          </p>

          {saved ? (
            <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 text-sm">
              Saved. Your profile is live in the directory.
            </div>
          ) : null}

          <form action={saveProfile} className="mt-10 flex flex-col gap-6">
            <Field
              label="Display name"
              name="displayName"
              defaultValue={existing?.displayName ?? null}
              hint="How you'd like to appear in the directory"
            />
            <Field
              label="Headline"
              name="headline"
              defaultValue={existing?.headline ?? null}
              hint="e.g. Founder, Acme Logistics"
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field
                label="Company"
                name="company"
                defaultValue={existing?.company ?? null}
              />
              <Field
                label="City"
                name="city"
                defaultValue={existing?.city ?? null}
              />
            </div>

            <Field
              label="Short bio"
              name="bio"
              defaultValue={existing?.bio ?? null}
              textarea
              rows={4}
              hint={`up to ${FIELD_LIMITS.bio} chars`}
            />
            <Field
              label="What I do"
              name="whatIDo"
              defaultValue={existing?.whatIDo ?? null}
              textarea
              rows={4}
              hint="What you offer or specialise in"
            />
            <Field
              label="Looking for intros to"
              name="idealClient"
              defaultValue={existing?.idealClient ?? null}
              textarea
              rows={4}
              hint="The kind of person you'd love an intro to"
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <Field
                label="LinkedIn URL"
                name="linkedinUrl"
                defaultValue={existing?.linkedinUrl ?? null}
                type="url"
              />
              <Field
                label="Website"
                name="websiteUrl"
                defaultValue={existing?.websiteUrl ?? null}
                type="url"
              />
            </div>

            <div className="mt-2 flex items-center gap-4">
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
              >
                Save profile
              </button>
              <p className="text-xs text-muted">
                Photo upload comes in a later update.
              </p>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

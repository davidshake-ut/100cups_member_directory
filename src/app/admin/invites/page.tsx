import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { auth, signIn } from "@/auth";
import { db } from "@/db/client";
import { invites, users } from "@/db/schema";
import { SiteHeader } from "@/components/site-header";

async function sendInviteEmail(email: string): Promise<boolean> {
  try {
    await signIn("resend", { email, redirect: false });
    return true;
  } catch {
    return false;
  }
}

export const dynamic = "force-dynamic";

function normalizeEmail(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || trimmed.length > 254 || !trimmed.includes("@")) return null;
  if (trimmed.includes('"')) return null;
  const parts = trimmed.split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return trimmed;
}

async function requireAdmin(): Promise<{ id: string }> {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  if (session.user.role !== "admin") redirect("/directory");
  return { id: session.user.id };
}

async function addInvite(formData: FormData) {
  "use server";
  const admin = await requireAdmin();

  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!email) {
    redirect("/admin/invites?error=invalid");
  }

  const existing = await db.query.invites.findFirst({
    where: eq(invites.email, email),
  });

  if (existing) {
    if (existing.revokedAt) {
      await db
        .update(invites)
        .set({ revokedAt: null })
        .where(eq(invites.id, existing.id));
      const sent = await sendInviteEmail(email);
      revalidatePath("/admin/invites");
      redirect(
        `/admin/invites?reactivated=${encodeURIComponent(email)}${sent ? "" : "&emailFailed=1"}`,
      );
    }
    redirect(`/admin/invites?error=duplicate&email=${encodeURIComponent(email)}`);
  }

  await db.insert(invites).values({
    email,
    invitedByUserId: admin.id,
  });

  const sent = await sendInviteEmail(email);
  revalidatePath("/admin/invites");
  redirect(
    `/admin/invites?added=${encodeURIComponent(email)}${sent ? "" : "&emailFailed=1"}`,
  );
}

async function revokeInvite(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/invites");

  await db
    .update(invites)
    .set({ revokedAt: new Date() })
    .where(eq(invites.id, id));

  revalidatePath("/admin/invites");
  redirect("/admin/invites?revoked=1");
}

async function reactivateInvite(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/invites");

  const [row] = await db
    .update(invites)
    .set({ revokedAt: null })
    .where(eq(invites.id, id))
    .returning({ email: invites.email });

  let sent = true;
  if (row?.email) {
    sent = await sendInviteEmail(row.email);
  }

  revalidatePath("/admin/invites");
  redirect(`/admin/invites?reactivated=1${sent ? "" : "&emailFailed=1"}`);
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return dateFormatter.format(d);
}

type InviteStatus = "pending" | "claimed" | "revoked";

function statusOf(invite: typeof invites.$inferSelect): InviteStatus {
  if (invite.revokedAt) return "revoked";
  if (invite.usedAt) return "claimed";
  return "pending";
}

const STATUS_STYLES: Record<InviteStatus, string> = {
  pending: "bg-accent/15 text-accent",
  claimed: "bg-emerald-100 text-emerald-700",
  revoked: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<InviteStatus, string> = {
  pending: "Pending",
  claimed: "Claimed",
  revoked: "Revoked",
};

export default async function AdminInvitesPage({
  searchParams,
}: {
  searchParams: Promise<{
    added?: string;
    revoked?: string;
    reactivated?: string;
    error?: string;
    email?: string;
    emailFailed?: string;
  }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const rows = await db
    .select({
      invite: invites,
      invitedBy: { name: users.name, email: users.email },
    })
    .from(invites)
    .leftJoin(users, eq(users.id, invites.invitedByUserId))
    .orderBy(desc(invites.createdAt));

  let banner: { tone: "ok" | "error"; message: string } | null = null;
  const emailSuffix = sp.emailFailed
    ? " (couldn't send email — check Resend setup)"
    : " — magic-link email sent.";
  if (sp.added) {
    banner = {
      tone: sp.emailFailed ? "error" : "ok",
      message: `Invite added for ${sp.added}${emailSuffix}`,
    };
  } else if (sp.reactivated) {
    const target =
      sp.reactivated === "1" ? "Invite reactivated" : `Invite reactivated for ${sp.reactivated}`;
    banner = {
      tone: sp.emailFailed ? "error" : "ok",
      message: `${target}${emailSuffix}`,
    };
  } else if (sp.revoked === "1") {
    banner = { tone: "ok", message: "Invite revoked." };
  } else if (sp.error === "invalid") {
    banner = { tone: "error", message: "That doesn't look like a valid email." };
  } else if (sp.error === "duplicate") {
    banner = {
      tone: "error",
      message: `${sp.email ?? "That email"} is already on the invite list.`,
    };
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 pt-16 pb-24">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.2em] text-accent">
              Admin
            </p>
            <Link
              href="/directory"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              ← Back to directory
            </Link>
          </div>

          <h1 className="mt-4 text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            Invites.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Add an email to let someone sign in. Revoke an invite to block
            future sign-ins (existing sessions are unaffected).
          </p>

          {banner ? (
            <div
              className={`mt-8 rounded-2xl border px-5 py-4 text-sm ${
                banner.tone === "ok"
                  ? "border-accent/30 bg-accent/10"
                  : "border-red-300 bg-red-50 text-red-800"
              }`}
            >
              {banner.message}
            </div>
          ) : null}

          <form
            action={addInvite}
            className="mt-8 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-6 sm:flex-row sm:items-end"
          >
            <label className="flex flex-1 flex-col gap-2">
              <span className="text-sm font-medium">Email to invite</span>
              <input
                type="email"
                name="email"
                required
                placeholder="someone@example.com"
                className="h-12 rounded-2xl border border-border bg-background px-5 text-base outline-none focus:border-accent"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
            >
              Add invite
            </button>
          </form>

          <div className="mt-10">
            <p className="mb-4 text-sm text-muted">
              {rows.length} {rows.length === 1 ? "invite" : "invites"} total.
            </p>
            {rows.length === 0 ? (
              <p className="rounded-2xl border border-border/70 bg-card p-6 text-sm text-muted">
                No invites yet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                <table className="w-full text-sm">
                  <thead className="bg-background/60 text-left text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Invited by</th>
                      <th className="px-5 py-3 font-medium">Created</th>
                      <th className="px-5 py-3 font-medium">Claimed</th>
                      <th className="px-5 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const status = statusOf(row.invite);
                      return (
                        <tr
                          key={row.invite.id}
                          className="border-t border-border/60"
                        >
                          <td className="px-5 py-3 align-middle">
                            {row.invite.email}
                          </td>
                          <td className="px-5 py-3 align-middle">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
                            >
                              {STATUS_LABEL[status]}
                            </span>
                          </td>
                          <td className="px-5 py-3 align-middle text-muted">
                            {row.invitedBy?.name ||
                              row.invitedBy?.email ||
                              "—"}
                          </td>
                          <td className="px-5 py-3 align-middle text-muted">
                            {formatDate(row.invite.createdAt)}
                          </td>
                          <td className="px-5 py-3 align-middle text-muted">
                            {formatDate(row.invite.usedAt)}
                          </td>
                          <td className="px-5 py-3 align-middle text-right">
                            {status === "revoked" ? (
                              <form action={reactivateInvite}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={row.invite.id}
                                />
                                <button
                                  type="submit"
                                  className="text-accent hover:text-accent-hover"
                                >
                                  Reactivate
                                </button>
                              </form>
                            ) : (
                              <form action={revokeInvite}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={row.invite.id}
                                />
                                <button
                                  type="submit"
                                  className="text-muted hover:text-red-700 transition-colors"
                                >
                                  Revoke
                                </button>
                              </form>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="mt-10 text-xs text-muted">
            Adding or reactivating an invite automatically emails a magic-link
            sign-in to that address. Resend must be configured with a verified
            domain for this to actually deliver.
          </p>
        </section>
      </main>
    </>
  );
}

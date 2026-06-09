import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { SiteHeader } from "@/components/site-header";

async function requestMagicLink(formData: FormData) {
  "use server";
  const raw = String(formData.get("email") ?? "").trim();
  if (!raw || raw.length > 254 || !raw.includes("@")) {
    redirect("/signin?error=invalid");
  }

  try {
    await signIn("resend", {
      email: raw,
      redirect: false,
      redirectTo: "/directory",
    });
  } catch {
    // Anti-enumeration: never leak whether the email is on the invite list.
  }
  redirect("/signin?sent=1");
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/directory");
  }
  const { sent, error } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-md px-6 pt-20 pb-16 sm:pt-28">
          <h1 className="font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            Sign in.
          </h1>
          <p className="mt-4 text-muted">
            Enter your email and we&apos;ll send a one-time sign-in link.
          </p>

          {sent ? (
            <div className="mt-10 rounded-2xl border border-border/60 bg-card p-6">
              <p className="font-display text-xl">Check your inbox.</p>
              <p className="mt-2 text-sm text-muted">
                A sign-in link is on its way. The link expires in 24 hours.
              </p>
              <Link
                href="/signin"
                className="mt-4 inline-block text-sm text-accent hover:text-accent-hover"
              >
                Send another link
              </Link>
            </div>
          ) : (
            <form action={requestMagicLink} className="mt-10 flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="h-12 rounded-full border border-border bg-card px-5 text-base outline-none focus:border-accent"
                />
              </label>
              {error === "invalid" ? (
                <p className="text-sm text-red-700">
                  Please enter a valid email address.
                </p>
              ) : null}
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
              >
                Send sign-in link
              </button>
            </form>
          )}

          <p className="mt-10 text-sm text-muted">
            Sign in to add or edit your profile in the directory.
          </p>
        </section>
      </main>
    </>
  );
}

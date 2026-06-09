import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/directory");

  const { email, error } = await searchParams;
  if (!email) redirect("/signin");

  const callbackUrl = encodeURIComponent("/directory");
  const encodedEmail = encodeURIComponent(email);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-md px-6 pt-20 pb-16 sm:pt-28">
          <h1 className="font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            Check your email.
          </h1>
          <p className="mt-4 text-muted">
            We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
            Enter it below to sign in.
          </p>

          {error && (
            <div className="mt-8 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-800">
              That code didn&apos;t work. It may have expired or been entered incorrectly.{" "}
              <Link href="/signin" className="underline">
                Send a new code.
              </Link>
            </div>
          )}

          {/* Plain GET form — Auth.js callback endpoint expects token + email as query params */}
          <form
            method="get"
            action="/api/auth/callback/nodemailer"
            className="mt-10 flex flex-col gap-4"
          >
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="callbackUrl" value="/directory" />
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Sign-in code</span>
              <input
                type="text"
                name="token"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                placeholder="123456"
                maxLength={6}
                className="h-12 rounded-full border border-border bg-card px-5 text-center text-xl tracking-[0.4em] outline-none focus:border-accent"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
            >
              Verify code
            </button>
          </form>

          <p className="mt-6 text-sm text-muted">
            Didn&apos;t get it?{" "}
            <Link href={`/signin?email=${encodedEmail}`} className="text-accent hover:text-accent-hover">
              Send another code
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

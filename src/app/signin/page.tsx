import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { SiteHeader } from "@/components/site-header";

async function requestCode(formData: FormData) {
  "use server";
  const raw = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!raw || raw.length > 254 || !raw.includes("@")) {
    redirect("/signin?error=invalid");
  }
  try {
    await signIn("nodemailer", { email: raw, redirect: false });
  } catch {
    // always show the code entry step to avoid leaking whether an email was sent
  }
  redirect(`/signin/verify?email=${encodeURIComponent(raw)}`);
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/directory");

  const { error } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-md px-6 pt-20 pb-16 sm:pt-28">
          <h1 className="font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            Sign in.
          </h1>
          <p className="mt-4 text-muted">
            Enter your email and we&apos;ll send you a 6-digit code.
          </p>

          <form action={requestCode} className="mt-10 flex flex-col gap-4">
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
            {error === "invalid" && (
              <p className="text-sm text-red-700">
                Please enter a valid email address.
              </p>
            )}
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
            >
              Send code
            </button>
          </form>

          <p className="mt-10 text-sm text-muted">
            Sign in to add or edit your profile in the directory.
          </p>
        </section>
      </main>
    </>
  );
}

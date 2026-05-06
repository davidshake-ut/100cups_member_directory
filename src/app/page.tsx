import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pt-24 pb-16 sm:pt-32">
          <p className="mb-6 text-sm uppercase tracking-[0.2em] text-accent">
            Members only
          </p>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            The 100 Cups
            <br />
            Mastermind Directory.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            A private place for members to find each other, share what they
            do, and describe the kind of clients they&apos;d love an
            introduction to.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signin"
              className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-accent-hover sm:w-auto"
            >
              Sign in with email
            </Link>
            <Link
              href="/directory"
              className="inline-flex h-12 items-center justify-center rounded-full border border-foreground/15 px-8 text-sm font-medium transition-colors hover:bg-foreground/5"
            >
              View directory
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16 border-t border-border/60">
          <p className="text-sm text-muted">
            Access is invite-only. If you&apos;re a member and haven&apos;t
            received an invite, ask the group organizer.
          </p>
        </section>
      </main>
    </>
  );
}

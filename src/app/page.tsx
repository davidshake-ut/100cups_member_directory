import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pt-24 pb-16 sm:pt-32">
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            The 100 Cups
            <br />
            Mastermind Directory.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Find other members, see what they do, and discover who&apos;d love
            an introduction.
          </p>
          <div className="mt-10">
            <Link
              href="/directory"
              className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
            >
              View directory
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}

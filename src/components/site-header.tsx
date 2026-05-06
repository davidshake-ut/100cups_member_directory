import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl tracking-tight">
            100 Cups <span className="text-accent">Directory</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <Link
            href="/directory"
            className="hover:text-foreground transition-colors"
          >
            Directory
          </Link>
          <Link
            href="/signin"
            className="rounded-full border border-foreground/15 px-4 py-1.5 text-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}

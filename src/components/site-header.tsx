import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="100 Cups" className="h-9 w-auto" />
          <span className="font-display text-xl font-semibold tracking-tight text-accent">
            Directory
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <Link
            href="/directory"
            className="hover:text-foreground transition-colors"
          >
            Directory
          </Link>
        </nav>
      </div>
    </header>
  );
}

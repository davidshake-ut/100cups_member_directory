import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { SiteHeader } from "@/components/site-header";

async function signInWithGoogle() {
  "use server";
  await signIn("google", { redirectTo: "/directory" });
}

async function signInWithMicrosoft() {
  "use server";
  await signIn("microsoft-entra-id", { redirectTo: "/directory" });
}

async function signInWithLinkedIn() {
  "use server";
  await signIn("linkedin", { redirectTo: "/directory" });
}

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/directory");
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-md px-6 pt-20 pb-16 sm:pt-28">
          <h1 className="font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            Sign in.
          </h1>
          <p className="mt-4 text-muted">
            Sign in to add or edit your profile in the directory.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-8 text-sm font-medium transition-colors hover:bg-foreground/5"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </form>

            <form action={signInWithMicrosoft}>
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-8 text-sm font-medium transition-colors hover:bg-foreground/5"
              >
                <MicrosoftIcon />
                Continue with Microsoft
              </button>
            </form>

            <form action={signInWithLinkedIn}>
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-8 text-sm font-medium transition-colors hover:bg-foreground/5"
              >
                <LinkedInIcon />
                Continue with LinkedIn
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

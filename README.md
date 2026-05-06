# 100 Cups Mastermind Directory

A private, invite-only member directory for the 100 Cups Mastermind community. Members sign in with a magic link, view each other's profiles, and edit their own.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Postgres on Railway, accessed via Drizzle ORM
- Auth.js v5 magic-link auth (via Resend)
- Cloudflare R2 for profile photos (S3 SDK)
- Deployed on Railway from GitHub

## Local development

```bash
npm install
cp .env.example .env.local
# fill in .env.local with your credentials
npm run dev
```

Open http://localhost:3000.

## Status

Early development. See commit history for what's wired up so far.

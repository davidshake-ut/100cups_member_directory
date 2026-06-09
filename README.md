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

Useful scripts:

- `npm run db:generate` — generate a new Drizzle migration from `src/db/schema.ts`
- `npm run db:migrate` — apply pending migrations against `DATABASE_URL`
- `npm run db:studio` — open Drizzle Studio to browse/edit data
- `npm run lint` — run ESLint
- `npm run build` — production build (also runs TypeScript check)

## Production deploy (Railway)

The repo includes a `railway.toml` so Railway will:

1. Build with Nixpacks (auto-detects Next.js)
2. Run `npm run db:migrate && npm run start` on each deploy — pending migrations apply automatically
3. Healthcheck against `/`

### Required environment variables

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. In Railway, link to your Postgres service via reference variable: `${{Postgres.DATABASE_URL}}`. |
| `AUTH_SECRET` | 32-byte random base64. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. **Use a different value than dev.** |
| `AUTH_TRUST_HOST` | `true` — required because Railway's edge proxy means the host header isn't `localhost`. Without this Auth.js refuses to issue cookies. |
| `AUTH_URL` | Optional. Set to your prod URL (e.g. `https://directory.coffeewithjason.com`) for canonical callback URLs. With `AUTH_TRUST_HOST=true` this is optional, but setting it explicitly is safer. |
| `RESEND_API_KEY` | Resend API key. Same key as dev works; or create a separate prod key. |
| `EMAIL_FROM` | Must be at a Resend-verified domain (e.g. `invites@directory.coffeewithjason.com`). The shared `onboarding@resend.dev` only delivers to your own Resend account. |
| `R2_ACCOUNT_ID` | Cloudflare account id |
| `R2_ACCESS_KEY_ID` | From an R2 API token scoped to the bucket |
| `R2_SECRET_ACCESS_KEY` | Paired with above. Cloudflare only shows it once at creation. |
| `R2_BUCKET` | e.g. `100cups-profile-photos` |
| `R2_PUBLIC_URL` | Public r2.dev URL (or custom domain) — `https://pub-xxx.r2.dev` |

### One-time Railway setup

1. **Create the app service.** Railway dashboard → **New** → **Deploy from GitHub repo** → select this repo. Railway will detect Next.js.
2. **Link the Postgres service.** In the new app service → **Variables** → **Add Reference Variable** → pick `DATABASE_URL` from your `Postgres` service.
3. **Add the rest of the env vars** from the table above.
4. **Set up a custom domain** (optional). Service → **Settings** → **Domains** → **Custom Domain** → add `directory.coffeewithjason.com` (or whatever) → add the CNAME record at your DNS provider.
5. **Trigger a deploy.** Railway redeploys on every push to `main`; the first deploy starts automatically once env vars are set. Watch the **Deploy logs** for `applying migrations...` and `Ready in ...`.

### After-deploy sanity check

1. Visit the Railway URL (or custom domain) → see the landing page
2. `/signin` → enter your email → magic-link arrives → click → land on `/directory`
3. `/admin/invites` if you're an admin → all the controls work as in dev

If signin fails with "untrusted host" errors in Railway logs, double-check `AUTH_TRUST_HOST=true`.

If the magic link goes to `http://localhost:3000` instead of your prod URL, set `AUTH_URL` explicitly to the prod URL.

## Project layout

- `src/app/` — App Router routes (`/`, `/signin`, `/directory`, `/profile`, `/admin/invites`, `/api/auth/[...nextauth]`)
- `src/auth.ts` — Auth.js v5 config + Drizzle adapter
- `src/db/` — Drizzle schema + client
- `src/lib/r2.ts` — Cloudflare R2 helpers (lazy env reads)
- `drizzle/` — generated SQL migrations + Drizzle metadata

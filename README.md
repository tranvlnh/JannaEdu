# Janna Edu

IELTS practice web app for Janna Academy: Reading/Listening mock tests, AI-graded Writing and Speaking, and AI learning paths for students and parents.

Stack: Next.js (App Router, TypeScript), Supabase (Postgres, Auth with Google, Storage), Gemini, zod.

## Prerequisites

- Node.js 20+ and [Bun](https://bun.sh) (the repo uses `bun.lock`)
- A Supabase project
- A Google OAuth client (for sign-in)
- A Gemini API key

## Install

```bash
bun install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase dashboard → Project Settings → API Keys (publishable key) |
| `SUPABASE_SECRET_KEY` | Same page (secret key). Server only, never prefix with `NEXT_PUBLIC_` |
| `GEMINI_API_KEY` | Google AI Studio |

## Set up the database

Link the Supabase CLI to your project (first time only):

```bash
bunx supabase login
bunx supabase link --project-ref <project-ref>
```

Apply all migrations and load the sample data (seeds are safe to re-run):

```bash
bunx supabase db push --remote --include-seed
```

The sample Listening test expects an audio file `sample-beeps.wav` in the `listening-audio` storage bucket. Upload it by hand in the dashboard.

## Set up Google sign-in

1. In Google Cloud Console, add `https://<project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI of the OAuth client.
2. In Supabase → Authentication → Providers, enable Google and paste the OAuth client ID and secret.
3. In Supabase → Authentication → URL Configuration, set the Site URL and add `http://localhost:3000/auth/callback` (plus your production URL) to the redirect URLs.

## Run

```bash
bun dev          # dev server on http://localhost:3000
bun run build    # production build
bun run start    # serve the production build
bun run lint
bun run test
```

## Changing the database schema

The schema changes only through migrations in `supabase/migrations/`. Don't edit the database in the dashboard, and don't hand-edit `src/server/supabase/database.types.ts`.

```bash
bunx supabase migration new <migration_name>   # creates an empty SQL file in supabase/migrations/
# write the SQL in that file (enable RLS on every new table)
bunx supabase db push --remote --dry-run       # preview which migrations will run
bun run db:push                                # apply them to the linked project
bun run db:types                               # regenerate types; commit them with the migration
```

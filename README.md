# Hybrid 21

Private, mobile-only training-plan PWA for one athlete: a 12-week half-marathon plan
(race **Saturday 2026-12-12**) combined with strength training and ice hockey.
Live at **https://hybrid-21.vercel.app**.

The full product spec and every owner decision live in [`CLAUDE.md`](CLAUDE.md)
(section 0 overrides the rest).

## Setup

Requires Node 22+.

```bash
npm install
npm run dev          # http://localhost:5173
```

## Scripts

| Script                    | What it does                                                     |
| ------------------------- | ---------------------------------------------------------------- |
| `npm run dev`             | Vite dev server (the `/design` preview route exists only here)   |
| `npm run build`           | Type-check and production build with service worker into `dist/` |
| `npm run preview`         | Serve the production build locally                               |
| `npm run lint`            | ESLint                                                           |
| `npm run typecheck`       | TypeScript for app, tooling and scripts                          |
| `npm test`                | Vitest unit and component tests (jsdom, `Europe/Belgrade`)       |
| `npm run test:e2e`        | Playwright journeys at iPhone widths against a fresh build       |
| `npm run format`          | Prettier                                                         |
| `npm run icons`           | Re-render the H21 icon set into `public/icons`                   |
| `npm run calendar:events` | Dump the Google Calendar event list derived from the plan        |

First Playwright run: `npx playwright install chromium`.

## Architecture

```text
src/
  app/         shell, routes, storage bootstrap, logs store, motion + session transitions
  components/  shared UI (bottom nav, week strip, list groups, form controls, shadcn/ui)
  data/        immutable plan: training plan, running plan, workout templates, exercises
  db/          Dexie database, versioned seed migration, repositories, backup, CSV export
  domain/      types, zod schemas, calculations (pace, volume), status derivation
  features/    today, plan, sessions, logging, history, stats, library, settings
  lib/         dates (ISO date-only), session type meta, type themes, calendar events
  styles/      design tokens (palette, type colors and themes, charts), AA contrast test
```

- **Plan vs. logs.** The plan is code (`src/data`) and read-only in the UI. Logs, the
  morning check-in and settings are the only mutable data, stored in IndexedDB.
- **Repositories.** UI talks to `SessionLogRepository`, `CheckInRepository`,
  `SettingsRepository` and `BackupRepository` (`src/db/repositories/types.ts`); Dexie is the
  only implementation today. Features never import Dexie.
- **Dates** are local `YYYY-MM-DD` strings; no UTC conversions, DST-safe.
- **Design** is token-based (`src/styles/tokens.css`). Brand screens use the four-color
  palette; everything about one session is re-tinted by `typeTheme(type)`.

## Data, backup and restore

All data stays **on the device** in the browser's IndexedDB; there is no server and no
account. Deleting the home-screen app, clearing Safari website data, or iOS storage clean-up
removes it. The app asks for persistent storage, but Safari may refuse.

- **Settings → Export backup** writes a versioned JSON file (share sheet on iPhone: save it
  to Files or iCloud Drive). A reminder appears after 7 days without a backup.
- **Restore** validates the file first, asks for confirmation and merges by stable ID, so
  importing the same file twice never duplicates anything; the newer edit wins.
- **Export CSV** writes `sessions.csv` and `gym-exercises.csv`.

Each person who opens the link gets their own, separate, empty data on their own device.

## Install on iPhone

1. Open https://hybrid-21.vercel.app in **Safari**.
2. Share → **Add to Home Screen**.
3. Open H21 from the home screen (full screen, works offline).
4. Make a first backup in Settings.

New versions show **Update available → Reload**. Animations follow iPhone Reduce Motion
unless Settings → Animations is set to **Always on**.

## Deploy

Vercel project `hybrid-21` in the owner's personal scope, deployed with the CLI (no Git
integration):

```bash
npx vercel deploy --prod --yes --scope matijanikolic-7753
```

`vercel.json` adds SPA rewrites and no-cache headers for the service worker and manifest.

## Google Calendar sync

The app does not talk to Google. Claude writes the plan into the owner's **Hybrid21**
Google Calendar through the Calendar connector. Events are derived from the same plan data
(`src/lib/calendar-events.ts`); `calendar/google-events.json` maps each event key to its
Google event ID, and a unit test fails if the plan and the mapping drift apart. To change
the calendar: run `npm run calendar:events -- --from <date>`, update or delete the affected
events by ID (never create duplicates), then update the mapping.

## Extension points

- **Exercise images:** `Exercise.imagePath` exists but is unused; add local WebP/AVIF files
  under `public/` and render them in the Library detail screen.
- **Cloud sync (e.g. Supabase):** implement the repository interfaces against the cloud
  and swap them in `src/db/index.ts`. Accounts would be needed to give each person their own
  cloud data.

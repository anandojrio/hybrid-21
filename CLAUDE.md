# Claude Code Master Prompt — Hybrid 21 MVP

You are building **Hybrid 21**, a private, mobile-only training-plan PWA for one athlete preparing for a half-marathon on **2026-12-12** while strength training and playing ice hockey.

Build the working MVP in the current repository. Do not merely describe the solution: inspect the repository, create the application, run it, test it, and fix issues. If the repository is empty, initialize it.

## 0. Owner decisions (these override anything below)

Decided with the owner on 2026-09-29:

- **Project location:** `C:\Hybrid21`.
- **No ICS anywhere.** The app has no calendar export. Instead, Claude writes the planned sessions directly into a dedicated Google Calendar named **Hybrid21** using the Google Calendar connector (see section 19). The owner creates that calendar; the connector cannot create calendars.
- **Design is decided together with the owner.** There is no reference design. Before building UI, Claude asks which components to use and proposes style options (fonts, palette, radius, density, shadcn preset); the owner answers with text or reference screenshots. Claude asks whenever it is unsure instead of guessing.
- **Theme:** light only, no dark mode (revised 2026-09-29). Main backgrounds are tinted from the palette, never plain white or black.
- **Design decisions so far:** calm and clean character; shadcn/ui **Nova** preset as the neutral base, restyled through tokens; **system font stack** (SF Pro on iPhone) with tabular numerals; **large key numbers**; **moderately rounded** shapes; RPE and pain as **sliders**; time as a single auto-formatting `hh:mm:ss` field; day bottom sheet as a swipe-to-dismiss **Drawer (vaul)**; **icon-only** bottom navigation (each tab still has an accessible label); **animations wanted**, always respecting `prefers-reduced-motion`.
- **Palette (owner reference, `docs/design-references/palette.jpg`):** Cool White `#D7E8FA`, Charcoal `#272B3A` (use the color shown in the swatch, not the mislabeled hex in the image), Lime/Mint `#5DF9C0`, Ocean Blue `#3B1EFF`. Claude may add harmonizing colors where needed and proposes them before use.
- **Session type colors (approved):** LEG `#FF9F1C`, RUN `#3B1EFF`, LONG `#1E0F99`, RACE `#FF4D3D`, ICE `#26C6F5`, PUSH `#FF5FA8`, PULL `#7C4DEB` (approved `#8B5CF6` darkened slightly: white text on it measured 4.23:1, below AA), MOB `#5DF9C0`, SOC `#C8F53B`. Text on each uses a dark shade of the same hue, or white on RUN/LONG/PULL. Tokens live in `src/styles/tokens.css`; `src/styles/tokens.test.ts` enforces AA contrast.
- **Layout:** option A, iOS-style grouped lists (rows inside rounded groups on the Cool White background), not separate cards.
- **Session detail screens are themed in their session type color** (e.g. a RUN detail is an Ocean Blue screen), like the colored screens in `docs/design-references/screens-colors-kpi-nav.jpg`.
- **Bottom navigation (decided):** icon-only Charcoal bar; the active tab rises in a Mint bubble into a smooth notch cut into the bar (option a, `screens-colors-kpi-nav.jpg`), animated with motion.
- **Week strip (decided):** each day pill shows date, type-colored icons and a status marker; slugs are in the accessible label and in the day bottom sheet, not printed in the pill.
- **Session icons (Lucide):** LEG Weight, RUN SportShoe, LONG Route, RACE Medal, ICE Snowflake (no hockey icon exists), PUSH BicepsFlexed, PULL Dumbbell, MOB Rotate3d, SOC Goal.
- **Design preview:** `/design` route, development builds only.
- **Logging UI (decided):** Mark as complete opens a full-height drawer form; status changes only after Save. Inside forms, quick single-item entries (gym exercise sets/reps/kg with "Last time", skip reason, morning check-in) use the owner-selected Animate UI Radix popover (`animate-ui.com/docs/components/radix/popover`), installed in the logging phase.
- **Actions by date (decided):** Mark as complete / Skip workout exist only for today and past sessions; future sessions show "Planned for <date>" and no actions.
- **Thursday either/or (decided, superseded by the Football entry below):** one card "<run> or soccer" with "Log run" (run form) and one-tap "Played soccer" (undo toast); the other option then shows as replaced. Skip on the card records the skip on the run and covers the group.
- **Completed ICE/SOC:** no data to edit, so the card offers "Remove completion" (with confirmation) instead of Edit result. Skipped sessions offer "Undo skip" (with confirmation).
- **Session detail:** `/session/:id`, full screen in the type color, no tab bar; Plan keeps the selected day in `?day=` so Back returns to the same week.
- **Gym prefill (decided):** each exercise starts with its last logged result and is saved as-is unless changed. Exercises never logged before show "Tap to enter" and are left out until entered; when a planned (non-optional) exercise is left out, "Performed differently" turns on (status modified) unless the owner turns it off.
- **Morning check-in (decided):** Today shows a prompt the morning after a logged run; the check-in is also available and editable on the run's detail screen (and in History).
- **Stats rules:** plan compliance counts past sessions plus today's only once logged; an either/or Thursday counts once and soccer satisfies it; a skipped "or off" run counts as done. Chart series colors `--chart-series-1` Ocean and `--chart-series-2` `#D9650B` (validated with the dataviz palette script); HR zones use one blue ramp; never two y-axes (load and reps are separate charts); every chart has a screen-reader summary and a "Show data" table. Weekly totals use dot-matrix tiles; trends use lines.
- **Delete result:** on the session detail screen, with confirmation; a run's morning check-in is deleted with it; the planned session stays.
- **CSV export (decided):** two files, `sessions.csv` (one row per logged session) and `gym-exercises.csv` (one row per exercise result).
- **Backup reminder (decided):** shown when logs exist and no backup was made in the last 7 days.
- **Component references:** seven-day strip with icons → `week-strip.jpg`; KPI tiles, big numbers with small decimals, dot-matrix charts → `screens-colors-kpi-nav.jpg`. Adapt them to the agreed palette.
- **Animation library:** `motion` (Framer Motion) is approved; animations are tuned in a later polish pass.
- **PULL high-fatigue and race-week variants:** the owner has none. Do not invent them; only PUSH has the fatigue contingency from section 10.
- **Google Calendar:** the Hybrid21 calendar lives on the owner's personal account. Only today and future sessions are written; a day with two sessions gets two events.
- **Session types:** each type (`leg`, `run`, `long`, `ice`, `push`, `pull`, `mob`, `soc`, `race`) gets its own color. Color is never the only signal (always slug text and icon too).
- **Hosting:** Vercel (owner account, connected later in the deploy phase). PWA install on iPhone requires the HTTPS deployment.
- **Redesign round (2026-09-29, after first iPhone test):** color follows content. Screens not about one session use a brand hero combining all four palette colors (Charcoal block, Mint eyebrow, Cool White title, Ocean chips/section titles/selection). Everything about one session (card, detail screen, logging drawer) is tinted in that type's color through `src/lib/type-theme.ts` and the `--type-*-page/surface/ink` tokens. Workout exercises are numbered cards with prescription chips; warm-up, run segments and stretching are timelines; run targets are fact tiles. Plan section is named **Run intensity**, with an effort bar per intensity and the full talk test. The bottom bar floats over a fade instead of a hard cut; tabs crossfade; screens are preloaded. The week strip slides a full week and the selected day stays selected while browsing other weeks (`?week=`). Hero status pills are translucent in the hero's text color.
- **Motion round (2026-09-29):** the notch bar is replaced by a Mint tile that slides between icons inside the Charcoal bar (the icon pops as it lands). Tabs slide in tab order; other screens rise in. Opening a session floods the screen in its type color from the tap point, then fades into the detail hero. Settings → Animations: _Follow iPhone_ (default, honours Reduce Motion) or _Always on_.
- **Logo (2026-09-30, owner-supplied):** `src/assets/logo-submark.svg` (emblem) and `logo-primary.svg` (emblem + HYBRID wordmark, for dark surfaces), kept in their own green/blue. The app icon is the emblem on Charcoal (replaces the H21 monogram; `npm run icons`). In the app: emblem in the Today hero and on the storage error screen, primary logo on a Charcoal card in Settings.
- **Schedule change (2026-10-08):** hockey moved from Wednesday to Thursday. Weeks 1–2 keep the original layout (logged history). Week 3: Wed ICE (played) + Thu ICE; its Thursday PUSH and run are dropped, Saturday long run shortened to 45 min after illness (Oct 1–6). From week 4: Mon LEG · Tue RUN + MOB · **Wed PUSH + RUN (or football)** · **Thu ICE** · Fri PULL · Sat LONG · Sun ICE. Running weeks 4–12 re-sequenced after the illness (week 4 rebuild, cutback moved to week 8, peak long run 95–100 min); week 4 gym at ~2/3 sets, RIR 3; race-week PUSH uses the A-week contingency; race-week Thursday hockey is optional/easy. Intensity guide unchanged: Garmin data confirmed easy (6:45/km at 142 bpm) and HM effort (5:53/km at 168 bpm). The owner's goal is sub-1:45 (4:58/km); Claude advised it is not realistic for Dec 12 from current data and kept the plan. Calendar updated in place (49 events).
- **Football (replaces "soccer" everywhere in the UI):** badge slug **JOGA** (data slug stays `soc`). The Thursday either/or shows only as the run ("<run> or football"); only that run's form has a **Replaced with football** switch, which logs the football session instead. Calendar titles: `RUN · Easy 30 min or Football`.
- **Workflow:** build in phases; after each phase show the result at 390 px before continuing. At every phase start, tell the owner which phase is starting and which phase is planned next; ask about anything the next phase needs clarified right away.

## 1. Product constraints

- Product name: **Hybrid 21**.
- App icon/monogram text: **H21**.
- UI language: **English only**.
- Single user; no accounts, login, authentication, or multi-user logic.
- Mobile-first and mobile-only optimized for iPhone widths 375–430 px.
- On wider screens, center the app in a container around 480 px; do not build a separate desktop experience.
- This is an installable PWA.
- The full plan, exercise library, navigation, and previously stored local data must work offline.
- Use local persistence only in MVP. Do not install or configure Supabase.
- The training plan is immutable in the UI. Users can log, edit, or delete results, but cannot edit planned sessions.
- Exercise images are out of scope for MVP. Do not show ugly empty image placeholders. Add an optional `imagePath` field to the exercise model for a later version.
- Visual identity is chosen with the owner (see section 0). Implement it with CSS variables/design tokens so it stays easy to restyle.

## 2. Required stack

Use:

- React
- TypeScript with strict mode
- Vite
- Tailwind CSS
- React Router
- shadcn/ui and Radix primitives where useful
- Lucide React icons
- React Hook Form
- Zod
- Dexie over IndexedDB
- Recharts
- date-fns
- vite-plugin-pwa
- Vitest and React Testing Library
- Playwright for critical user journeys
- ESLint and Prettier

Do not add TanStack Query because there is no remote API. Keep dependencies purposeful.

## 3. Architecture

Use feature-oriented code and separate immutable plan data from mutable logs.

Suggested structure:

```text
src/
  app/
  components/
  data/
    training-plan.ts
    running-plan.ts
    workout-templates.ts
    exercises.ts
  db/
    database.ts
    repositories/
    migrations/
  domain/
    types.ts
    schemas.ts
    calculations.ts
  features/
    today/
    plan/
    history/
    stats/
    library/
    logging/
    settings/
  hooks/
  lib/
  styles/
public/
  icons/
```

Create repository interfaces, for example `WorkoutLogRepository`, with a Dexie implementation. UI components must not call Dexie directly. This should allow a later cloud repository without rewriting the feature UI.

Keep these concepts separate:

- Exercise definition
- Workout template
- Planned dated session
- Completed session/log
- Exercise result
- Run result
- Morning check-in

Use stable string IDs. Never derive permanent IDs from array indices.

## 4. PWA requirements

- App name and short name: `Hybrid 21` and `H21`.
- Create a simple local H21 icon set, including an iOS apple-touch icon and maskable PWA icons.
- Include a web app manifest and service worker.
- Cache the app shell and immutable plan content.
- Show a small offline indicator only when relevant.
- Handle updates gracefully with an unobtrusive “Update available” action.
- Respect iPhone safe areas using `env(safe-area-inset-*)`.
- All interactive targets must be at least 44 × 44 px.
- All form input text must be at least 16 px to prevent iOS zoom.
- Request persistent storage using `navigator.storage.persist()` when supported, but do not assume it will be granted.

## 5. Navigation

Use a persistent bottom tab bar with five destinations:

1. **Today**
2. **Plan**
3. **History**
4. **Stats**
5. **Library**

Settings opens from the header and contains backup, restore, CSV export, and app information.

## 6. Session types and slugs

Use these data slugs exactly; render badges in uppercase:

| Data slug | Display badge | Type                                 |
| --------- | ------------- | ------------------------------------ |
| `leg`     | LEG           | Leg strength                         |
| `run`     | RUN           | Easy or quality run                  |
| `long`    | LONG          | Long run                             |
| `ice`     | ICE           | Ice hockey                           |
| `push`    | PUSH          | Chest, biceps, front shoulder        |
| `pull`    | PULL          | Back, triceps, rear/lateral shoulder |
| `mob`     | MOB           | Mobility and core                    |
| `soc`     | SOC           | Optional soccer                      |
| `race`    | RACE          | Half-marathon                        |

Use appropriate Lucide icons. If Lucide does not have an ice-hockey-specific icon, use a simple sport/activity icon rather than adding another icon library.

Statuses:

- `planned`
- `completed`
- `modified`
- `skipped`

Never communicate status with color alone.

## 7. Date rules

The active plan begins Monday **2026-09-21**. The race is Saturday **2026-12-12**. Use local calendar dates, not UTC conversions that can shift a session by one day. Treat planned dates as ISO date-only strings (`YYYY-MM-DD`).

Weekly base schedule:

| Day       | Planned work                                                 |
| --------- | ------------------------------------------------------------ |
| Monday    | LEG                                                          |
| Tuesday   | RUN plus MOB/Core later in the day                           |
| Wednesday | ICE                                                          |
| Thursday  | PUSH plus either an easy RUN or optional SOC when prescribed |
| Friday    | PULL                                                         |
| Saturday  | LONG, except race day uses RACE                              |
| Sunday    | ICE                                                          |

A Thursday prescription written as “easy run or soccer” is an either/or choice group, not a requirement to complete both. Selecting one while logging is allowed and does not count as editing the plan.

## 8. Exact 12-week running plan

Create the following dated plan exactly. Duration is the primary target; pace is guidance. Heart rate, RPE, and talk test override pace when they disagree.

### Provisional intensity guide

| Intensity             |          HR | RPE | Talk test                          | Pace guide       |
| --------------------- | ----------: | --: | ---------------------------------- | ---------------- |
| Recovery              | 125–138 bpm | 1–2 | Completely effortless conversation | 7:00–7:30 min/km |
| Easy                  | 130–145 bpm | 2–3 | Comfortable full sentences         | 6:45–7:20 min/km |
| Steady                | 146–158 bpm | 4–5 | Short but controlled sentences     | 6:15–6:35 min/km |
| Upper-steady          | 152–164 bpm | 5–6 | Several words at a time            | 6:05–6:25 min/km |
| Controlled threshold  | 164–175 bpm |   7 | Brief phrases                      | 5:40–5:58 min/km |
| Provisional HM effort | 158–170 bpm | 6–7 | Controlled but purposeful          | 5:50–6:08 min/km |

Show a clear notice that these are provisional training targets, not laboratory-confirmed physiological zones.

### Sessions

| Week             | Tuesday                                                                                               | Thursday                                                                | Saturday                                               | Focus                        |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------- |
| 1, Sep 21–27     | Sep 22: 30 min easy; run-walk allowed                                                                 | Sep 24: 20–25 min recovery/easy at 125–142 bpm, 7:00–7:25/km, or soccer | Sep 26: 40 min easy at 130–145 bpm, 6:50–7:20/km       | Establish tolerance          |
| 2, Sep 28–Oct 4  | Sep 29: 35 min easy at 130–145 bpm; optional 4 × 15 s relaxed strides                                 | Oct 1: 25–30 min recovery/easy at 125–142 bpm, or soccer                | Oct 3: 50 min easy at 130–145 bpm, 6:45–7:15/km        | Confirm knee/tissue response |
| 3, Oct 5–11      | Oct 6: 10 min easy + 3 × 5 min steady at 146–158 bpm, 2 min easy between + 10 min easy                | Oct 8: 30 min easy at 130–145 bpm, or soccer                            | Oct 10: 60 min easy at 130–145 bpm                     | Introduce moderate work      |
| 4, Oct 12–18     | Oct 13: 35 min easy + 4–6 × 15 s relaxed strides                                                      | Oct 15: 25 min recovery/easy or off                                     | Oct 17: 50 min easy at 130–145 bpm                     | Cutback                      |
| 5, Oct 19–25     | Oct 20: 10 min easy + 3 × 7 min steady at 146–158 bpm, 2 min easy between + 10 min easy               | Oct 22: 30–35 min easy, or soccer                                       | Oct 24: 70 min easy at 130–145 bpm                     | Extend controlled work       |
| 6, Oct 26–Nov 1  | Oct 27: 10 min easy + 2 × 10 min upper-steady at 152–164 bpm, 3 min easy between + 10 min easy        | Oct 29: 35 min easy, or soccer                                          | Oct 31: 80 min easy at 130–145 bpm                     | Aerobic strength             |
| 7, Nov 2–8       | Nov 3: 40 min easy + 4–6 × 15 s relaxed strides                                                       | Nov 5: 25–30 min recovery/easy or off                                   | Nov 7: 65 min easy at 130–145 bpm                      | Cutback                      |
| 8, Nov 9–15      | Nov 10: 12 min easy + 3 × 8 min controlled threshold at 164–175 bpm, 3 min easy between + 10 min easy | Nov 12: 35 min easy at 130–145 bpm                                      | Nov 14: 90 min easy at 130–145 bpm                     | Start race-specific block    |
| 9, Nov 16–22     | Nov 17: 12 min easy + 2 × 12 min HM effort at 158–170 bpm, 4 min easy between + 10 min easy           | Nov 19: 35–40 min easy, or soccer                                       | Nov 21: 95 min easy; final 10 min steady only if fresh | Race-specific endurance      |
| 10, Nov 23–29    | Nov 24: 12 min easy + 3 × 10 min HM effort, 3 min easy between + 10 min easy                          | Nov 26: 30–35 min easy                                                  | Nov 28: 100–105 min easy at 130–145 bpm                | Peak week                    |
| 11, Nov 30–Dec 6 | Dec 1: 10 min easy + 2 × 8 min HM effort, 3 min easy between + 10 min easy                            | Dec 3: 25–30 min easy                                                   | Dec 5: 65–70 min easy                                  | Reduce volume                |
| 12, Dec 7–12     | Dec 8: 30 min easy + 4 × 15 s relaxed strides                                                         | Dec 10: 20 min very easy or off                                         | Dec 12: Half-marathon                                  | Taper and race               |

### Run coaching rules shown in the app

- Easy sessions should feel controlled enough for full-sentence conversation.
- On hills, heat, poor sleep, or accumulated fatigue, effort/HR wins over pace.
- Do not speed up in the final five minutes of an easy session just to improve the average.
- Walking for 30–60 seconds is allowed if HR rises unexpectedly or tissue discomfort develops.
- If knee pain exceeds 2/10, changes gait, is sharp, causes swelling/instability, or is worse next morning, reduce/stop and seek professional assessment when appropriate.
- Soccer replaces the prescribed optional Thursday run; it is never added on top.
- The app must not automatically rewrite the plan based on logged data.

Pre-seed the known Sep 22 completed run only if cleanly implemented as a versioned seed migration:

- Date: 2026-09-22
- Distance: 4.5 km
- Time: 00:30:22
- Avg pace: approximately 6:45 min/km
- Avg HR: 142 bpm
- Max HR: 174 bpm
- Avg power: 296 W
- HR zones: Z1 00:00:28, Z2 00:20:23, Z3 00:09:09, Z4 00:00:22, Z5 00:00:00

Mark estimated/derived values clearly if needed. Do not seed any data that was not supplied.

## 9. Gym warm-ups

### LEG warm-up

1. Easy cycling: 3–4 min
2. Knee-to-wall ankle rocks: 8/side
3. 90/90 hip transitions: 6/side
4. Adductor rock-backs: 8/side
5. Reverse lunge with reach: 5/side
6. Bodyweight squats: 8
7. From Week 3, low pogo hops are part of the workout
8. Back-squat ramp: empty bar × 8–10; approximately 40–50% of work weight × 5; 60–70% × 3; 75–85% × 1–2

### PUSH warm-up

1. Easy rower or bike: 3 min
2. Thoracic extensions over a bench or roller: 6
3. Wall slides: 8
4. Scapular push-ups: 8
5. Light band external rotations: 10/side
6. Progressive warm-up sets for barbell bench press

### PULL warm-up

1. Easy rowing: 3 min
2. Cat–cow or controlled thoracic flexion/extension: 6
3. Side-lying thoracic rotations: 5/side
4. Scapular pull-ups: 6–8
5. Light band pull-aparts: 10–12
6. Easy pull-up or pulldown preparation set

Warm-up sets are never included in gym logging.

## 10. Locked gym workouts

### LEG — Monday

| Order | Exercise                               | Prescription             | Rest      | Focus                                         |
| ----: | -------------------------------------- | ------------------------ | --------- | --------------------------------------------- |
|     1 | Low pogo hops                          | From Week 3: 2 × 10      | 60–90 s   | Small elastic/power exposure                  |
|     2 | Back squat                             | 3 × 4–6 at RIR 2–3       | 2.5–4 min | Bilateral lower-body strength                 |
|     3 | Romanian deadlift                      | 3 × 6–8 at RIR 2         | 2–3 min   | Hip hinge/posterior chain                     |
|     4 | Reverse lunge or Bulgarian split squat | 2 × 6–8 per leg at RIR 2 | 90–150 s  | Unilateral strength/control                   |
|     5 | Seated leg curl                        | 2 × 8–12 at RIR 1–2      | 75–120 s  | Knee-flexion hamstring strength               |
|     6 | Seated calf raise                      | 3 × 8–12 at RIR 1–2      | 75–120 s  | Soleus/plantar-flexor capacity                |
|     7 | Adductor machine                       | 2 × 10–15 at RIR 2       | 60–90 s   | Direct adductor dose                          |
|     8 | Side plank                             | 2 × 25–40 s/side         | 60 s      | Trunk control; Pallof press is an alternative |

For Week 1 only, show the reduced introductory volume: squat 2 × 5 RIR 3; RDL 2 × 6 RIR 3; reverse lunge 2 × 6/leg RIR 3; leg curl 2 × 10; calf 2 × 10; adductor 1–2 × 12; no pogo hops.

### PUSH — Thursday

| Order | Exercise                           | Prescription           | Rest      | Focus                           |
| ----: | ---------------------------------- | ---------------------- | --------- | ------------------------------- |
|     1 | Barbell bench press                | 4 × 4–6 at RIR 2       | 2.5–4 min | Main measurable press           |
|     2 | Low-incline dumbbell press, 20–30° | 3 × 8–12 at RIR 1–2    | 2–3 min   | Clavicular chest emphasis       |
|     3 | Smith-machine shoulder press       | 2 × 8–12 at RIR 1–2    | 2 min     | Front deltoid/overhead strength |
|     4 | Pec-deck machine                   | 2 × 10–15 at RIR 1–2   | 75–120 s  | Chest isolation                 |
|     5 | Preacher curl                      | 3 × 8–12 at RIR 1–2    | 90–120 s  | Stable supinated curl           |
|     6 | Dumbbell hammer curl               | 2–3 × 10–15 at RIR 1–2 | 75–120 s  | Brachialis/brachioradialis      |

Technique notes:

- Bench uses double progression: build from 4 reps toward 4 × 6, then add the smallest practical load.
- Incline should stay around 20–30°, not excessively steep.
- Pec deck: back supported, small fixed elbow bend, handles around mid/lower chest, finish with controlled horizontal adduction without rolling shoulders forward.
- Default to Smith shoulder press; Arnold press is an alternative block variation.
- Do not add front raises, dips, extra flies, or shrugs to this session.

Biceps alternatives should be changed in blocks of 4–6 weeks, not randomly every week:

- Preacher curl ↔ incline dumbbell curl ↔ Bayesian cable curl
- Dumbbell hammer curl ↔ rope hammer curl ↔ neutral-grip cable curl

Fatigue contingency:

- A week: bench 4 × 4–6, incline DB 2–3 × 8–12, omit shoulder press.
- B week: bench 4 × 6–8 lighter, omit incline, shoulder press 3 × 8–12.
- This is a contingency, not the default plan.

### PULL — Friday

| Order | Exercise                         | Prescription                  | Rest        | Focus                          |
| ----: | -------------------------------- | ----------------------------- | ----------- | ------------------------------ |
|     1 | Pull-ups                         | 4 × 6–10 at RIR 1–2           | 2.5–3.5 min | Vertical pulling strength/lats |
|     2 | Chest-supported row              | 3 × 6–10 at RIR 1–2           | 2–3 min     | Horizontal pulling/upper back  |
|     3 | One-arm cable lat row            | 2 × 10–15 per side at RIR 1–2 | 75–120 s    | Unilateral lat work            |
|     4 | Reverse pec deck                 | 3 × 12–20 at RIR 1–2          | 75–120 s    | Posterior deltoid/upper back   |
|     5 | Cable lateral raise              | 2–3 × 12–20 at RIR 1–2        | 60–90 s     | Middle deltoid                 |
|     6 | Overhead cable triceps extension | 3 × 8–12 at RIR 1–2           | 90–120 s    | Lengthened triceps/long head   |
|     7 | Cable pushdown                   | 2 × 10–15 at RIR 1–2          | 75–120 s    | Additional triceps work        |
|     8 | Dumbbell or machine shrug        | Optional 2 × 8–15 at RIR 1–2  | 90–120 s    | Upper trapezius                |

Pull-up progression:

- Record all four set totals.
- Once 4 × 10 is completed cleanly at RIR 1–2, add approximately 2.5 kg and return to 4 × 6–8.
- If later sets drop below six clean reps, assisted reps may finish the range.

Alternatives:

- Pull-up: weighted pull-up, chin-up, neutral-grip pulldown
- Chest-supported row: incline dumbbell row, seated cable row, inverted row
- One-arm cable lat row: half-kneeling pulldown, one-arm machine row, straight-arm pulldown
- Reverse pec deck: cable reverse fly, chest-supported rear-delt raise, face pull
- Cable lateral raise: dumbbell or machine lateral raise
- Overhead extension: single-arm overhead cable or overhead dumbbell extension
- Pushdown: cross-body extension, machine dip, close-grip push-up
- Shrug: cable or trap-bar shrug

Coaching alternatives are read-only and never mutate the plan automatically. The owner has no PULL high-fatigue or race-week variants; do not invent them (section 0).

## 11. Mobility and core

Place the dedicated session on Tuesday after the run, preferably later in the day. Alternate Session A and B weekly.

### Dynamic mobility before core

1. Cat–cow: 6 slow reps
2. 90/90 hip transitions: 6/side
3. Adductor rock-backs: 8/side
4. Knee-to-wall ankle rocks: 8–10/side
5. Side-lying open books: 6/side
6. Kettlebell halos: 2 × 5–6 each direction, light and controlled

### Core A

| Exercise                             | Prescription           | Rest    |
| ------------------------------------ | ---------------------- | ------- |
| Kettlebell dead bug pullover         | 3 × 6–8                | 60–75 s |
| Plank kettlebell pass-through        | 3 × 6–8 each direction | 60–90 s |
| Half-kneeling kettlebell woodchopper | 3 × 8–10/side          | 60–90 s |
| Seated controlled twist              | 2 × 8–10/side          | 60 s    |

### Core B

| Exercise                    | Prescription            | Rest    |
| --------------------------- | ----------------------- | ------- |
| Kettlebell around-the-world | 3 × 8–12 each direction | 60 s    |
| Suitcase march              | 3 × 30–45 s/side        | 60–90 s |
| Kettlebell oblique drop     | 2–3 × 8–12/side         | 60–75 s |
| Controlled lateral rotation | 2–3 × 8/side            | 60–75 s |

Label “controlled lateral rotation” as requiring final technique confirmation; do not invent a definitive demonstration. Include a caution to keep load light and avoid forced lumbar rotation.

### Static stretching after core

- Half-kneeling hip-flexor stretch: 2 × 30–45 s/side
- Straight-knee calf stretch: 1 × 45 s/side
- Bent-knee soleus stretch: 1 × 45 s/side
- Adductor rock/frog stretch: 2 × 30–45 s
- Supine hamstring stretch: 1 × 45 s/side
- Figure-four glute stretch: 1 × 45 s/side
- Kneeling lat stretch on bench: 1 × 45 s
- Doorway pectoral stretch: 1 × 30–45 s/side

Alternation:

- Weeks 1, 3, 5, 7, 9, 11: A
- Weeks 2, 4, 6, 8, 10: B
- Week 12: light mobility and 1–2 easy sets only
- Weeks 1–2 and cutback/taper weeks can use two sets per exercise.

## 12. Today screen

Show:

- Date and current plan week
- Today’s session cards in chronological plan order
- Slug, icon, title, session goal, expected duration
- Warm-up, workout/run tactics, and cooldown/mobility sections
- Coaching note
- Tomorrow preview
- Primary action: **Mark as complete**
- Secondary action: **Skip workout**

There is no Start Workout button.

For `ice` and `soc`, Mark as complete must immediately save completion with no logging form. Provide a short undo action. There are no data fields for hockey or soccer.

For other types, Mark as complete opens the appropriate form. The status changes only after a successful save.

If completed, show View result and Edit result.

## 13. Plan screen

Build a compact seven-day weekly calendar with week navigation, swipe support, previous/next arrows, and a Today button.

Each day shows:

- Date number
- Small icons
- One or more slugs
- Accessible status marker

Multiple sessions can appear on one day. Tapping a day opens a bottom sheet with all sessions. Tapping a session opens full details.

The race date must be clearly marked. The plan is read-only.

## 14. Logging behavior

### Gym logging

Pre-populate all planned exercises. Do not log warm-up sets.

Standard loaded exercise:

- Sets completed
- Total reps across all working sets
- Load in kg

Unilateral exercise:

- Sets completed
- Reps per side
- Load in kg

Time-based exercise:

- Sets completed
- Total hold time in seconds
- No load unless the exercise definition explicitly permits it

Bodyweight pull-up:

- Sets completed
- Total reps
- Optional added load in kg; blank means bodyweight

Pogo hops:

- Sets completed
- Total contacts/reps
- No load

Show the latest logged result for the same exercise next to the form, such as `Last time: 4 sets · 34 reps · bodyweight`. For unilateral work, label values explicitly.

Allow an overall optional note and `modified` status when the performed version differs from prescribed work.

### Running logging

Use a progressive, mobile-friendly form divided into sections.

Required overview fields, using Garmin-style labels and units:

- Distance (km)
- Time (hh:mm:ss)
- Avg Pace (min/km)
- Avg HR (bpm)
- Max HR (bpm)

Optional Garmin fields:

- Time in HR Zone 1 (hh:mm:ss)
- Time in HR Zone 2 (hh:mm:ss)
- Time in HR Zone 3 (hh:mm:ss)
- Time in HR Zone 4 (hh:mm:ss)
- Time in HR Zone 5 (hh:mm:ss)
- Aerobic Training Effect (0.0–5.0)
- Anaerobic Training Effect (0.0–5.0)
- Avg Power (W)
- Total Ascent (m)
- Avg Run Cadence (spm)

Subjective fields:

- Session RPE (1–10)
- Talk test: Full sentences / Short sentences / Few words
- Knee pain during run (0–10)
- Knee pain after run (0–10)
- Notes

Optional next-morning check-in, editable later from History:

- Knee pain next morning (0–10)
- General soreness (0–10)
- Energy (1–5)

Validate ranges and time formats with Zod. Calculate expected average pace from time and distance and show a non-blocking warning if it differs materially from entered Garmin Avg Pace. Do not overwrite the Garmin value.

Do not include calories, sweat loss, ground contact time, vertical oscillation, vertical ratio, stride length, max power, max cadence, or best pace in MVP.

### Mobility/core logging

Open a minimal form:

- Session A or B, preselected from plan
- Completed as prescribed: yes/no
- Optional duration in minutes
- Optional note

### Skip flow

Reason choices:

- Fatigue
- Work
- Pain
- Illness
- Schedule
- Other

Optional note. Skipping must not delete the planned session.

## 15. History

Filters:

- All
- Running
- Gym
- Ice
- Soccer
- Mobility
- Completed
- Modified
- Skipped

Each card shows date, type, slug/icon, status, key result, and RPE where relevant. Detail pages show the immutable prescription and separately show the recorded result. Logs can be edited or deleted with confirmation; planned sessions remain.

## 16. Stats

Use meaningful empty states and never fabricate data.

Running KPIs:

- Runs completed this week
- Weekly distance
- Weekly running time
- Longest run
- Current long-run progression
- Plan compliance
- Average session RPE
- Latest knee-pain status

Running charts:

- Weekly distance
- Long-run duration
- Avg Pace trend
- Avg HR trend
- Avg Power trend only when enough power data exists
- Weekly time in HR zones
- RPE and knee-pain trend

Compute aggregated average pace from total elapsed time divided by total distance, never by taking the arithmetic mean of pace strings.

Strength:

- Latest result and change from previous for each exercise
- Pull-up total-reps trend
- Bench load and total-reps trend
- Back-squat load and total-reps trend
- Completed gym sessions
- Volume load when valid: `total reps × load kg`; do not multiply by sets again

Keep charts readable at 375 px, use tabular numerals, and provide text summaries accessible to screen readers.

## 17. Library

No images in MVP. Do not render image placeholders.

Provide searchable/filterable exercise entries with:

- Name
- Category/muscle focus
- Short purpose
- Setup
- 2–4 technique cues
- Common mistakes
- Prescription where used
- Rest and RIR
- Alternatives
- Workouts containing the exercise
- Optional `imagePath` in the model for future local WebP/AVIF assets

Include concise, practical descriptions for every exercise and mobility drill listed in this prompt. Do not make medical guarantees.

## 18. Backup and export

Because IndexedDB is local-only, implement:

- Export full backup as versioned JSON
- Restore from JSON with schema validation and confirmation
- Export logs as CSV
- Show last backup date
- Non-intrusive reminder if no backup has been made recently
- Avoid duplicate records during restore by stable IDs

## 19. Google Calendar sync (done by Claude, not by the app)

The app does not talk to Google Calendar and does not generate ICS files. Do not implement OAuth, the Calendar API, or ICS in the app.

Claude populates the owner's **Hybrid21** Google Calendar through the Google Calendar connector:

- Derive events from the exact same canonical plan data used by the UI (a script under `scripts/` dumps the event list as JSON). Never maintain a second manual list of dates.
- One all-day event per planned session; no time of day; no reminders; availability free.
- Titles such as `LEG · Leg Strength`, `RUN · Easy 35 min`, `ICE · Ice Hockey`, `PUSH · Upper Body`, `PULL · Upper Body`, `MOB · Mobility + Core A`, `RACE · Half Marathon`; the either/or Thursday shows as e.g. `RUN/SOC · Easy 30 min or Soccer`.
- Concise description including the stable session ID.
- Show the owner a preview (count, date range, sample events) and get approval before writing.
- Keep a committed mapping `calendar/google-events.json` (event key → Google event ID, date, title, colorId) so re-syncs update instead of duplicating. A unit test fails if the plan and this mapping drift apart.
- **Status (2026-09-29):** synced. 97 events from 2026-09-29 to 2026-12-12 in the Hybrid21 calendar (owner's personal account). To change the calendar later: run `npm run calendar:events -- --from <date>`, then update or delete the affected events by their IDs from the mapping (never create a second copy), and update the mapping file.

## 20. Temporary design requirements

The owner decides the art direction during the design phase (section 0). Until then, keep structure and usability first.

For MVP:

- Theme from the owner palette via CSS custom properties/design tokens
- Clean single-column layout
- Bottom navigation
- No decorative gradients, neon, glowing shapes, generic fitness hero sections, or stock imagery
- Do not overuse cards
- Minimum 16 px body/form text
- WCAG AA contrast
- Visible focus states
- Semantic HTML
- Reduced-motion support
- Light theme only (no dark mode)
- Create the H21 icon as the only initial graphic asset

## 21. Error and edge cases

Handle:

- First launch with no logs
- IndexedDB failure
- Restore validation errors
- Duplicate imports
- Form draft close confirmation
- Offline state
- PWA update state
- Sessions with multiple same-day activities
- Either/or Thursday run versus soccer choice
- Date boundaries and daylight-saving changes
- Missing optional Garmin metrics
- Deleted log reverting session status to planned
- Edited completed log preserving original `createdAt` and updating `updatedAt`

Use inline, specific errors rather than generic toasts. Toasts may confirm non-critical success only.

## 22. Tests

At minimum write tests for:

- Date-only plan generation across all 12 weeks
- Correct exact race date
- Thursday either/or choice behavior
- Session status derivation
- Pace calculation and parsing
- Gym volume calculation
- Pull-up bodyweight/additional-load display
- Running schema validation
- JSON backup/restore round trip
- Calendar event derivation: all-day dates and stable session IDs
- Week calendar navigation
- Mark ICE complete in one tap with no form
- Mark SOC complete in one tap with no form
- Gym completion form and previous-result display
- Running form and morning check-in
- Offline app-shell availability

Critical Playwright journey at 390 px:

1. Open Today.
2. Navigate to Plan.
3. Open a planned RUN.
4. Mark as complete.
5. Enter required run data.
6. Save.
7. Confirm status and History entry.
8. Confirm Stats update.
9. Open ICE and complete in one tap.
10. Export a JSON backup.

## 23. Acceptance criteria

The MVP is complete only when:

- `npm install`, `npm run dev`, `npm run build`, `npm run lint`, and tests work.
- There are no TypeScript errors.
- It is usable at 375, 390, and 430 px without horizontal overflow.
- It installs as an iPhone-compatible PWA and has the H21 icon.
- The canonical plan contains all exact dates and sessions.
- Plan content works offline.
- Logs persist in IndexedDB.
- ICE and SOC complete with one tap and no form.
- Gym and running logs use the exact field behavior above.
- Previous gym results are visible while logging.
- Stats are calculated from real saved data only.
- Backup, restore, and CSV export work.
- The Hybrid21 Google Calendar contains every planned session.
- Plan editing is impossible from UI.
- The code is modular enough for a later visual redesign and optional Supabase repository.

## 24. Implementation workflow

1. Inspect the repo and summarize the current state.
2. Propose a concise implementation plan and file structure.
3. Build domain types, immutable plan data, and calculations first.
4. Build Dexie repositories and migrations.
5. Build routing and mobile shell.
6. Implement Today, Plan, logging, History, Stats, Library, and Settings.
7. Add PWA support and backup/export. Sync the plan to Google Calendar once plan data is tested.
8. Add tests.
9. Run lint, tests, and production build.
10. Fix all failures.
11. Provide a concise README with setup, scripts, architecture, backup caveats, PWA installation on iPhone, Google Calendar sync, and future image/Supabase extension points.

Do not stop at scaffolding. Deliver a functioning, tested MVP. When a requirement is ambiguous, choose the simplest implementation consistent with this prompt and document the decision instead of inventing new product features.

# 🥪 Toastie Queue 

Eating toastie's is the most important part of the workday. Imagine you sneaky peaky added double cheese to YOUR toastie only for some coworker to grab it because: "they all look the same". Meanwhile you have to eat their sad single cheese toasti, a work day ruined in my opinion.  

That is exactly why toasti queue exists, simply drag your name onto the toastie iron while your sandwich is cooking, and everyone knows which masterpiece belongs to whom. No more guessing. No more accidental toastie theft. No more workplace tragedies.

Built with SolidJS + Tailwind v4 + Vite, plus a tiny Node server with SQLite 
so every device sees the same queue AND NOBODY CAN SAY THEY DIDNT SEE IT WAS MY DOUBLE CHEESE TOASTIE

## How it works

State lives on the server in one SQLite file. Clients load it with `GET /api/sync`,
push changes with `PUT /api/state` and get everyone else's over SSE (`GET /api/events`).
No accounts, last writer wins. In dev the API runs as Vite middleware; in production
`server/index.ts` serves `dist/` plus the API. Node 24+, zero runtime dependencies.

Names, colors and per-person eaten counts are managed in the app (Edit and Scoreboard
buttons). Renames keep tostis and scores, deletes don't. UI is EN/NL, strings in
`src/store/i18n.ts`.

The UI targets a 13.3" touchscreen: pointer-event dragging (`src/effects/dnd.ts`, the
HTML5 drag API never fires on touch), no hover, finger-sized targets, an on-screen
keyboard on touch-only devices. Fits 1280x720 without scrolling.

## Layout

- `shared/` — types, limits and sanitising used by both sides
- `server/` — HTTP API, SQLite access, SSE broadcast
- `src/store/` — client state (`store.ts`), derived tosti logic (`tosti.ts`), strings (`i18n.ts`)
- `src/effects/` — dragging, toasts, the ready chime
- `src/components/` — grouped per area: `iron/`, `people/`, `tosti/`, `modals/`

## Tweaking

- grill times (`MIN`/`MAX`/`DEFAULT_GRILL_SECONDS`, `BURNT_FACTOR`), slot count
  (`MIN`/`MAX`/`DEFAULT_IRON_SLOTS`) and `NAME_MAX`: `shared/state.ts`
- `PALETTE`: `src/store/tosti.ts`
- faces and the tosti drawing: `src/components/tosti/faces.tsx`, `TostiSvg.tsx`

## Deploy

```bash
docker compose up -d --build   # http://<host>:8080
```

Database sits in the `tosti-data` volume. Kiosk: `chromium --kiosk --app=http://localhost:8080`.

`pnpm dev` listens on all interfaces, so phones on the same wifi can join.
There is no auth. Keep it off the internet.

## Commands

`make` lists all targets: install, dev, build, serve, check, eslint, eslint_fix,
format, formatcheck, lint, formatlint, up, down, logs, clean, reset-db.

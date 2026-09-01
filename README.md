# 🥪 Toastie Queue 

Eating toastie's is the most important part of the workday. Imagine you sneaky peaky added double cheese to YOUR toastie only for some coworker to grab it because: "they all look the same". Meanwhile you have to eat their sad single cheese toasti, a work day ruined in my opinion.  

That is exactly why toasti queue exists, simply drag your name onto the toastie iron while your sandwich is cooking, and everyone knows which masterpiece belongs to whom. No more guessing. No more accidental toastie theft. No more workplace tragedies.

Built with SolidJS + Tailwind v4 + Vite, plus a tiny Node server with SQLite 
so every device sees the same queue AND NOBODY CAN SAY THEY DIDNT SEE IT WAS MY DOUBLE CHEESE TOASTIE

## How it works

State lives on the server in one SQLite file. Clients load it with `GET /api/sync`,
push changes with `PUT /api/state` and get every write back over SSE (`GET /api/events`).
No accounts, last writer wins: the server stamps each write with a revision and
broadcasts it to everyone, and clients drop anything at or below the revision they
already hold, so concurrent writers converge on the same state. A client that hears
nothing for a minute (the server pings every 25s) assumes its stream died silently
and reconnects. In dev the API runs as Vite middleware; in production
`server/index.ts` serves `dist/` plus the API. Node 24+, zero runtime dependencies.

Names, colors, per-person eaten counts and measured grill stats are managed in the
app (Edit and Scoreboard buttons). Renames keep toasties and scores, deletes don't.
The UI, daily facts and fake ad breaks are available in EN/NL. Ad breaks can be
turned off per device in the Set up modal or with `?ads=off` in the URL.

The UI targets a 13.3" touchscreen: pointer-event dragging (`src/effects/dnd.ts`, the
HTML5 drag API never fires on touch), no hover, finger-sized targets, an on-screen
keyboard on touch-only devices. Fits 1280x720 without scrolling.

## Layout

- `shared/`: types, limits and sanitising used by both sides
- `server/`: HTTP API, SQLite access, SSE broadcast
- `src/store/`: client state (`store.ts`), toastie logic (`toastie.ts`), strings (`i18n.ts`)
- `src/effects/`: dragging, toasts, the ready chime
- `src/components/`: grouped per area, `iron/`, `people/`, `toastie/`, `modals/`

## Tweaking

- grill times (`MIN`/`MAX`/`DEFAULT_GRILL_SECONDS`, `BURNT_FACTOR`), slot count
  (`MIN`/`MAX`/`DEFAULT_IRON_SLOTS`) and `NAME_MAX`: `shared/state.ts`
- `PALETTE`: `src/store/toastie.ts`
- faces and the toastie drawing: `src/components/toastie/faces.tsx`, `ToastieSvg.tsx`
- daily facts: `src/content/toastieFacts.ts`
- fake ad copy: `src/components/modals/AdBreak.tsx`

## Deploy

The image builds the bundle itself, so the box only needs Docker. No Node on it,
and no copying `dist/` around. Ship the source and rebuild in place:

```bash
git clone https://github.com/MosieMosie/toastie-queue.git
cd toastie-queue
docker compose up -d --build   # http://<host>:8080
```

To update: `git pull && docker compose up -d --build`. The container gets
replaced, `data/` stays put.

The database is a bind mount at `data/toastie.db`, so a backup is
`scp <host>:~/toastie-queue/data/toastie.db .`. If you copy it while the server is
running, use `sqlite3 toastie.db ".backup 'out.db'"` rather than `cp`. The file is
in WAL mode and a plain copy of a live database can come out torn.

`restart: unless-stopped` brings the container back after a reboot, as long as
Docker itself starts on boot (`sudo systemctl enable --now docker`).

Kiosk: point a browser at it full screen, `chromium --kiosk http://localhost:8080`.
Wait for the container to answer before launching, the browser starts well before
Docker does.

`pnpm dev` listens on all interfaces, so phones on the same wifi can join.
There is no auth. Keep it off the internet.

## Commands

`make` lists all targets: install, dev, build, serve, check, eslint, eslint_fix,
format, formatcheck, lint, formatlint, up, down, logs, clean, reset-db.

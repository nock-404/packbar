# Development

## Setup

```bash
docker compose up -d      # Postgres on port 5435
pnpm install
pnpm db:migrate
pnpm seed                 # optional
pnpm dev                  # http://localhost:4100
```

### Environment variables

`.env`, template in `.env.example`:

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | Postgres connection |
| `BETTER_AUTH_SECRET` | Session secret |
| `BETTER_AUTH_URL` | Public base URL, also used for links in emails |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `SMTP_FROM` | Mail delivery. Without `SMTP_HOST`, mails go to the log |
| `CRON_SECRET` | Key for the last-minute route |
| `UPLOAD_DIR` | Where custom covers are stored, defaults to `./data/uploads` |

The seed script creates `dev@packbar.local` with the password `packbar1234` and
one example list. If the list already exists it does nothing.

### Commands

| | |
|---|---|
| `pnpm dev` | Development server on port 4100 |
| `pnpm build` / `pnpm start` | Production |
| `pnpm test` | Vitest — unit and component tests |
| `pnpm db:generate` | Generate a migration from the schema |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm lint` | ESLint |

The tests under `lib/dal/` and `lib/lastMinuteMail.test.ts` talk to a real
database — Docker has to be running.

## Structure

```
app/(app)          dashboard and list detail, behind login
app/(auth)         register, sign in, verify, password reset
app/share/[token]  shared list, reachable without an account
app/api            auth, uploads, weather, polling, cron
app/actions        server actions; they check ownership
lib/dal            data access — the only place with SQL
lib/template.ts    turn templates and copies into database rows
lib/default-template.ts  the 220 items
lib/presets.ts     which categories belong to which trip type
lib/suggestions.ts quantities from the number of nights
lib/import.ts      text import: bullets, numbering, checkboxes, quantities
components/lists   list detail: reducer store, DnD, filters, sharing
```

### State in the list detail

An optimistic reducer store. Every change lands in state immediately and goes
out as a server action in parallel; if it fails, the server state is refetched
and a message is shown.

Shared lists in edit mode poll every five seconds — **except** while one of your
own mutations is in flight. Otherwise a stale response would overwrite the
change you just typed. Polling also pauses when the tab isn't visible.

### Access control

Three layers, none of which replaces another:

1. `proxy.ts` redirects unauthenticated access to `/dashboard` and `/lists` to
   the login page.
2. Every server action fetches the session itself (`requireUserId`).
3. Every DAL function checks ownership (`assertListOwner`) — including the ones
   reached through a share token, which additionally check the share mode.

Share tokens are 24 random bytes as base64url. "Renew link" generates a new one,
which invalidates the old one instantly.

### Uploads

Custom covers are resized to at most 1600 px wide with `sharp` and stored as
WebP; 5 MB maximum, JPEG/PNG/WebP only as input. The file id is a UUID and is
validated against a UUID pattern on read — otherwise `../../etc/passwd` would be
a valid filename. Deleting one resets the cover on every list of that user that
was using it.

### Last-minute mail

`GET /api/cron/last-minute?key=<CRON_SECRET>` looks for lists whose trip date is
today and for which no mail has gone out yet, and sends the owner the open
last-minute items. `lastMinuteMailSentAt` prevents duplicates — so the route is
safe to run several times a day.

## House rules in the code

- **No native scrollbars anywhere** — everything scrollable uses `overlayscrollbars`.
- **No `window.alert`/`confirm`/`prompt`** — the project's own dialog components.
- **No hardcoded UI strings** — everything through `next-intl`, with
  `messages/de.json` and `messages/en.json` holding identical keys.
- **Icons only from `react-icons/tb`.**
- Tabs, width 4. No px where rem works.

## Deployment

The included `Dockerfile` builds an image that applies migrations on start and
then serves on port 4100. It needs a reachable Postgres database and the
environment variables above.

Point `UPLOAD_DIR` at a persistent volume — otherwise uploaded covers are gone
after every deploy.

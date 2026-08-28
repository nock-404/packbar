# Entwicklung

## Einrichten

```bash
docker compose up -d      # Postgres auf Port 5435
pnpm install
pnpm db:migrate
pnpm seed                 # optional
pnpm dev                  # http://localhost:4100
```

### Umgebungsvariablen

`.env`, Vorlage in `.env.example`:

| Variable | Bedeutung |
|---|---|
| `DATABASE_URL` | Postgres-Verbindung |
| `BETTER_AUTH_SECRET` | Sitzungsschlüssel |
| `BETTER_AUTH_URL` | Öffentliche Basis-URL, auch für Links in Mails |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `SMTP_FROM` | Mailversand. Fehlt `SMTP_HOST`, landen Mails im Log |
| `CRON_SECRET` | Schlüssel für die Last-Minute-Route |
| `UPLOAD_DIR` | Ablage eigener Cover, Vorgabe `./data/uploads` |

Das Seed-Skript legt `dev@packbar.local` mit dem Passwort `packbar1234` an und
eine Beispielliste. Ist die Liste schon da, tut es nichts.

### Befehle

| | |
|---|---|
| `pnpm dev` | Entwicklungsserver auf Port 4100 |
| `pnpm build` / `pnpm start` | Production |
| `pnpm test` | Vitest — Unit und Komponenten |
| `pnpm db:generate` | Migration aus dem Schema |
| `pnpm db:migrate` | Migrationen anwenden |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm lint` | ESLint |

Die Tests unter `lib/dal/` und `lib/lastMinuteMail.test.ts` sprechen eine echte
Datenbank an — Docker muss laufen.

## Aufbau

```
app/(app)          Dashboard und Listen-Detail, hinter Login
app/(auth)         Registrieren, Anmelden, Verifizieren, Passwort
app/share/[token]  Geteilte Liste, ohne Konto erreichbar
app/api            Auth, Uploads, Wetter, Polling, Cron
app/actions        Server Actions, prüfen die Ownership
lib/dal            Datenzugriff — die einzige Stelle mit SQL
lib/template.ts    Vorlage und Kopien in Datenbankzeilen übersetzen
lib/default-template.ts  die 220 Einträge
lib/presets.ts     welche Kategorien zu welchem Reisetyp gehören
lib/suggestions.ts Mengen aus der Anzahl Nächte
lib/import.ts      Text-Import: Bullets, Nummerierung, Checkboxen, Mengen
components/lists   Listen-Detail: Reducer-Store, DnD, Filter, Teilen
```

### Zustand im Listen-Detail

Ein optimistischer Reducer-Store. Jede Änderung landet sofort im State und geht
parallel als Server Action raus; scheitert sie, wird der Server-Stand
nachgeladen und eine Meldung eingeblendet.

Geteilte Listen im Bearbeiten-Modus pollen alle fünf Sekunden — **außer**
während eine eigene Mutation offen ist. Sonst würde eine veraltete Antwort die
gerade getippte Änderung überschreiben. Das Polling pausiert außerdem, wenn der
Tab nicht sichtbar ist.

### Zugriffsschutz

Drei Ebenen, keine ersetzt die andere:

1. `proxy.ts` leitet nicht angemeldete Zugriffe auf `/dashboard` und `/lists`
   zum Login um.
2. Jede Server Action holt die Session selbst (`requireUserId`).
3. Jede DAL-Funktion prüft die Ownership (`assertListOwner`) — auch die über
   einen Share-Token, dort zusätzlich gegen den Modus.

Share-Tokens sind 24 Zufallsbytes als base64url. „Link erneuern" erzeugt einen
neuen und macht den alten damit sofort ungültig.

### Uploads

Eigene Cover werden mit `sharp` auf maximal 1600 px Breite gebracht und als
WebP abgelegt, höchstens 5 MB und nur JPEG/PNG/WebP als Eingabe. Die Datei-Id
ist eine UUID und wird beim Lesen gegen ein UUID-Muster geprüft — sonst wäre
`../../etc/passwd` ein gültiger Dateiname. Beim Löschen wird das Cover aller
Listen des Users zurückgesetzt, die es benutzt haben.

### Last-Minute-Mail

`GET /api/cron/last-minute?key=<CRON_SECRET>` sucht Listen, deren Reisetag heute
ist und für die noch keine Mail raus ist, und schickt dem Besitzer die offenen
Last-Minute-Einträge. `lastMinuteMailSentAt` verhindert Doppelversand — die
Route darf also mehrmals am Tag laufen.

## Regeln im Code

- **Nirgends native Scrollbalken** — alles Scrollbare über `overlayscrollbars`.
- **Kein `window.alert`/`confirm`/`prompt`** — eigene Dialog-Komponenten.
- **Kein hardcodeter UI-String** — alles über `next-intl`, `messages/de.json`
  und `messages/en.json` mit identischen Keys.
- **Icons nur aus `react-icons/tb`.**
- Tabs, Breite 4. Keine px, wo rem geht.

## Deployment

Das mitgelieferte `Dockerfile` baut ein Image, das beim Start die Migrationen
anwendet und dann auf Port 4100 startet. Es braucht eine erreichbare
Postgres-Datenbank und die Umgebungsvariablen von oben.

`UPLOAD_DIR` sollte auf ein persistentes Volume zeigen — sonst sind die
hochgeladenen Cover nach jedem Deploy weg.

<div align="center">

# packbar

### Nie wieder was vergessen.

Die Packliste zum Abhaken: mit einer Vorlage aus **220 Einträgen**, zum Teilen
gemacht und am Ende sauber ausgedruckt.

`Next.js 16` · `React 19` · `Postgres` · `Drizzle` · `Better Auth` · `Tailwind 4`

</div>

---

## Warum noch eine Packliste

Weil die meisten entweder eine leere Notiz-App sind oder eine App, die dir
sagen will, wie du zu reisen hast. packbar macht genau eine Sache: eine Liste,
die man abhakt — und bringt dafür eine Vorlage mit, bei der Streichen schneller
geht als Erinnern.

Jede Liste ist ein Boarding-Pass: Cover, Zielcode, Countdown, Fortschritt,
Perforation. Was im Koffer liegt, wird durchgestrichen. Der Rest bleibt
sichtbar.

## Was es kann

| | |
|---|---|
| **Vorlage mit 220 Einträgen** | 26 Kategorien von Reisepass bis Powerbank, mit Unterkategorien |
| **Presets** | Strand, Roadtrip, Camping, Städtetrip, Winter, Mit Kindern, Mit Haustier — oder alles |
| **Mengen-Vorschläge** | Aus dem Reisezeitraum: 7 Nächte → 8× Unterwäsche, 5× T-Shirt, 2× Schlafanzug |
| **Teilen per Link** | Nur ansehen oder mitbearbeiten. Wer den Link hat, hakt mit ab — ganz ohne eigenes Konto |
| **Live-Sync** | Geteilte Listen gleichen sich ab, während zwei Leute gleichzeitig packen |
| **Last-Minute** | Einträge, die erst am Abreisetag in den Koffer. Am Reisetag kommt eine Mail mit dem, was noch offen ist |
| **Wetter am Ziel** | Ziel eintragen, packbar holt die Vorhersage und weist auf Regen hin |
| **Import** | Liste aus WhatsApp oder Notizen reinkopieren — Bullets, Nummerierung, Checkboxen und `3x` werden erkannt |
| **Personen** | Einträge Leuten zuordnen, danach filtern |
| **Drag & Drop** | Einträge und Kategorien umsortieren, auch zwischen Kategorien |
| **Druckansicht** | Zweispaltig, schwarzweiß, reist als Zettel mit |
| **Eigene Cover** | 15 kuratierte Bilder, drei Verläufe — oder ein eigenes hochladen |
| **PWA & Dark Mode** | Installierbar, offline-tauglich, hell und dunkel |

## Loslegen

```bash
docker compose up -d      # Postgres auf Port 5435
pnpm install
pnpm db:migrate
pnpm seed                 # optional: Dev-Konto + Beispielliste
pnpm dev                  # http://localhost:4100
```

Umgebungsvariablen in `.env`, Vorlage in `.env.example`. Ohne `SMTP_HOST`
landen Mails im Server-Log statt im Postfach — für lokale Entwicklung reicht
das.

Mehr zu Aufbau, Tests und Deployment: **[DEVELOPMENT.md](DEVELOPMENT.md)**

## Gestaltung

Boarding-Pass als Leitbild: Perforation statt Trennlinie, Zielcode als
Ticket-Stempel, Mono-Ziffern für alles Zählbare. Bricolage Grotesque für
Überschriften, Instrument Sans für Text, Space Mono für Meta.

Nirgends native Scrollbalken, nirgends ein `window.confirm`. Jeder UI-String
läuft über `next-intl` — Deutsch und Englisch sind gepflegt.

## Lizenz

MIT. Cover-Bilder von [Unsplash](https://unsplash.com), Fotografinnen und
Fotografen in [`public/covers/ATTRIBUTION.md`](public/covers/ATTRIBUTION.md).

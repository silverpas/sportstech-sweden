# SportsTech Sweden — Ecosystem Directory

A living directory that maps the Swedish SportsTech ecosystem: **startups, investors, and incubators/accelerators**. Browse and filter companies, see who invests in whom, and let startups add themselves via a moderated submission form.

🔗 **Live site:** _add your Vercel URL here_

---

## What's inside

- **Home** — headline stats, a sector breakdown, and three visualizations: industries, ecosystem growth over time, and a map of Sweden by city.
- **Companies** — searchable, filterable directory (by sector, industry, city, funding stage), colour-coded by sector.
- **Company profile** — full details for each company plus its investors.
- **Investors** — each investor with the companies they back (linked both ways).
- **Incubators** — accelerators and support programs.
- **Add your startup** — a public form; submissions are held as *pending* until an admin approves them.
- **Admin** (`/admin`) — password-protected page to approve or reject submissions.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Charts | Recharts + a custom SVG map |
| Hosting | Vercel |
| Data tooling | Python (import + optional enrichment) |

## Colour system

Companies are grouped by sector, using a colourblind-safe palette:

- 🟢 **For Athletes** · 🔵 **For Executives** · 🟣 **For Fans**

---

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

> **Windows note:** keep this project **outside** any OneDrive-synced folder. OneDrive corrupts the Next.js `.next` build folder and causes crashes on `npm run dev`.

### Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```
NEXT_PUBLIC_SUPABASE_URL=…            # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=… # Supabase publishable (anon) key — safe for the browser
SUPABASE_URL=…                        # same URL (used by server + scripts)
SUPABASE_KEY=…                        # Supabase secret (service_role) key — server only, keep private
ADMIN_TOKEN=…                         # password for the /admin approval page
# ANTHROPIC_API_KEY=…                 # optional, only for enrich_data.py
```

### Database setup

Run `setup.sql` once in the Supabase SQL editor. It adds the `moderation_status`
column so new submissions stay hidden until approved.

---

## Data pipeline (Python)

- **`import_data.py`** — imports the source Excel (startups, investors, incubators, and investor↔company links) into Supabase.
- **`enrich_data.py`** — *optional.* Uses the Anthropic Claude API with web search to fill in missing descriptions, employee counts, status, and funding stage. Requires `ANTHROPIC_API_KEY`.

```bash
pip install pandas openpyxl supabase python-dotenv anthropic
python import_data.py
```

---

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import it in Vercel (Next.js is auto-detected).
3. Add the environment variables above in the Vercel project settings.
4. Deploy. Pushing to `main` redeploys automatically.

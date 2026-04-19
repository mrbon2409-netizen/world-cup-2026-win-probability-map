# World Cup 2026 Win Probability Map

Single-page React app that tracks World Cup 2026 title probabilities for all 48 teams with daily snapshot history, a premium interactive map, stage-probability estimates, group standings, fixtures, results, and static export support.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Recharts
- MapLibre GL JS
- Papa Parse

## Run locally

1. Install dependencies

```bash
cmd.exe /c npm install
```

2. Generate the current snapshot and history once

```bash
cmd.exe /c npm run snapshot:daily
```

3. Start the dev server

```bash
cmd.exe /c npm run dev
```

4. Or build the static dashboard

```bash
cmd.exe /c npm run snapshot:daily:build
```

## Core data files

- Editable source odds data: `data/worldcup2026_master.json`
- Daily automation config: `data/automation-config.json`
- Latest generated snapshot: `public/data/worldcup2026-current.json`
- Daily snapshot history: `public/data/worldcup2026-history.json`
- Automation status for the UI: `public/data/automation-status.json`
- Embedded static history: `src/data/worldcup2026-history.static.json`
- Embedded static automation status: `src/data/automation-status.static.json`
- CSV export source: `public/worldcup2026_odds.csv`

## Data scripts

Refresh the latest snapshot and automation status:

```bash
cmd.exe /c npm run snapshot:daily
```

Refresh the snapshot and rebuild the static site:

```bash
cmd.exe /c npm run snapshot:daily:build
```

Append or replace a specific snapshot date manually:

```bash
cmd.exe /c npm run history:append -- --date=2026-04-18
```

## Daily automation

A Codex cron automation named `Daily WC Snapshot` is configured for this workspace and runs every day at `08:00 AM` in `America/Toronto`.

Its job is to:

- refresh the current snapshot
- update snapshot history
- update automation status metadata
- rebuild the static `dist` output

## Netlify deployment

This repo now includes [netlify.toml](C:/Users/Admin/Documents/Codex/2026-04-18-build-a-complete-single-page-web/world-cup-2026-win-probability-map/netlify.toml).

Netlify should use:

- Build command: `npm run build:static`
- Publish directory: `dist`

For daily rebuilds after snapshot updates:

- connect the repo to Netlify
- keep the GitHub Actions workflow enabled at [.github/workflows/daily-refresh.yml](C:/Users/Admin/Documents/Codex/2026-04-18-build-a-complete-single-page-web/world-cup-2026-win-probability-map/.github/workflows/daily-refresh.yml)
- each daily workflow run commits the refreshed snapshot files, and Netlify redeploys automatically on that push

## Notes

- ISO3 remains the primary team join key.
- England and Scotland still use dedicated handling where the world geometry does not separate them cleanly.
- FIFA ranking is contextual only.
- Snapshot freshness and automation state are now surfaced in the dashboard UI with `Last auto update`, `Next scheduled update`, and `Data source status`.

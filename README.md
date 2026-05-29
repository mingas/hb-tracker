# hb-tracker

Hormone Type Quiz + Daily Tracker for **The Hormone Blueprint** — a privacy-first women's hormone assessment tool.

## What's inside

This repository hosts the client-side code for two integrated tools:

1. **Hormone Type Quiz** — 12-question assessment that identifies one of 5 hormone types based on STRAW+10 clinical framework
2. **Daily Tracker** — personalised daily symptom log with pattern detection (built in Sprint 2)

## Tech stack

- **Vanilla JavaScript** (no build step required)
- **localStorage** for data persistence (everything stays on the user's device)
- **jsDelivr CDN** for distribution
- **Webflow** for hosting (embedded via Code Embed)
- **No backend, no database, no AI/API** — fully client-side

## Privacy architecture

All user data (Quiz results, daily logs, patterns) is stored exclusively in the user's browser localStorage. Nothing is sent to any server. Even we cannot see the data.

## Clinical foundation

- **STRAW+10** — Stages of Reproductive Aging Workshop (Harlow et al., 2012)
- **Rotterdam criteria** — PCOS classification (2003)
- **Vermeulen formula** — Free hormone calculations (1999)

## Project structure

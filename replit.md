# QuantumDx - Quantum-Integrated AI Cancer Diagnostics Platform

## Overview
A next-generation research platform exploring cancer diagnostics through quantum physics, biophysics, and artificial intelligence. The platform visualizes breast tissue impedance spectroscopy data and presents the scientific rationale for physics-driven cancer detection.

## Recent Changes
- 2026-02-12: Initial platform build with dark scientific theme, 5 pages, impedance data dashboard, PostgreSQL database with 106 seeded samples

## Architecture
- **Frontend**: React + TypeScript with Vite, Shadcn UI components, Recharts for data visualization, Framer Motion for animations
- **Backend**: Express.js API serving impedance data from PostgreSQL
- **Database**: PostgreSQL with drizzle-orm, seeded from CSV data (106 breast tissue impedance samples)
- **Styling**: Dark-first scientific theme with teal/cyan accents (HSL 175), Inter font, JetBrains Mono for code

## Pages
1. **Home** (`/`) - Landing page with project overview, stats, capabilities
2. **Dashboard** (`/dashboard`) - Interactive impedance data visualizations (bar, pie, scatter, radar charts)
3. **Research** (`/research`) - Scientific rationale, mechanical properties evidence, AI pipeline details
4. **Technology** (`/technology`) - Platform architecture, quantum physics integration, innovation factors
5. **Publications** (`/publications`) - Key references, project documentation, target audience

## Data Model
- `impedanceSamples` table: id, tissueClass, i0, pa500, hfs, da, area, aDa, maxIp, dr, p
- 6 tissue classes: car (carcinoma), fad (fibroadenoma), mas (mastopathy), gla (glandular), con (connective), adi (adipose)

## Key Files
- `shared/schema.ts` - Data models and tissue class metadata
- `server/seed.ts` - Seeds database from attached CSV file
- `server/db.ts` - Database connection
- `client/src/components/app-sidebar.tsx` - Navigation sidebar
- `client/src/components/theme-provider.tsx` - Dark/light theme support

## User Preferences
- Dark scientific aesthetic preferred
- Research-grade presentation style

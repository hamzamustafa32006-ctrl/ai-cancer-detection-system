# Cellytics - AI Cancer Diagnostics Platform for Physicians

## Overview
An AI-powered diagnostic support platform for physicians. Doctors input electrical impedance spectroscopy measurements and receive instant tissue classification predictions (cancerous vs benign) based on a KNN classifier trained on 106 verified breast tissue samples.

## Recent Changes
- 2026-02-12: Converted diagnosis to dual file upload — impedance + Raman spectroscopy for combined analysis
- 2026-02-12: Added Diagnosis page with KNN classifier for tissue prediction, prediction history stored in PostgreSQL
- 2026-02-12: Refocused platform for physician use — doctor-facing landing page, diagnosis as primary feature
- 2026-02-12: Initial platform build with dark scientific theme, 6 pages, impedance data dashboard

## Architecture
- **Frontend**: React + TypeScript with Vite, Shadcn UI components, Recharts for data visualization, Framer Motion for animations
- **Backend**: Express.js API with KNN classifier for tissue classification, PostgreSQL storage
- **Database**: PostgreSQL with drizzle-orm, seeded from CSV data (106 breast tissue impedance samples)
- **Classifier**: K-Nearest Neighbors (K=7) with z-score normalization, binary classification (malignant vs benign)
- **Styling**: Dark-first scientific theme with navy blue accents (#07235A / HSL 220), Inter font, JetBrains Mono for code

## Pages
1. **Home** (`/`) - Doctor-focused landing page with platform overview and CTA to diagnosis
2. **Diagnosis** (`/diagnosis`) - CSV file upload for batch tissue classification, results table, prediction history
3. **Dashboard** (`/dashboard`) - Interactive impedance data visualizations (bar, pie, scatter, radar charts)
4. **Research** (`/research`) - Scientific rationale, mechanical properties evidence, AI pipeline details
5. **Technology** (`/technology`) - Platform architecture, quantum physics integration, innovation factors
6. **Publications** (`/publications`) - Key references, project documentation, target audience

## Data Model
- `impedanceSamples` table: id, tissueClass, i0, pa500, hfs, da, area, aDa, maxIp, dr, p
- `predictionHistory` table: id, createdAt, i0-p (9 features), predictedClass, confidence, isMalignant, nearestClasses
- 6 tissue classes: car (carcinoma), fad (fibroadenoma), mas (mastopathy), gla (glandular), con (connective), adi (adipose)

## API Endpoints
- GET /api/impedance-samples - All training data
- GET /api/stats - Dataset statistics
- POST /api/diagnosis - Upload impedance + Raman CSV files, returns combined analysis
- GET /api/diagnosis-history - Recent prediction history

## Key Files
- `shared/schema.ts` - Data models, tissue class metadata, diagnosis input validation
- `server/classifier.ts` - KNN classifier implementation
- `server/routes.ts` - API endpoints including diagnosis
- `server/seed.ts` - Seeds database from attached CSV file
- `client/src/pages/diagnosis.tsx` - Diagnosis form and results UI
- `client/src/components/app-sidebar.tsx` - Navigation sidebar

## User Preferences
- Dark scientific aesthetic preferred
- Research-grade presentation style
- Platform focused for physician diagnostic support

# F1 Race Insights - Frontend

Next.js frontend for the F1 Race Insights prediction system.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Run development server
npm run dev
```

Visit http://localhost:3000

## Features

- **Home**: Overview of features and models
- **Race Explorer**: Interactive race predictions with charts
- **Backtest**: Model comparison and evaluation metrics
- **Docs**: API documentation and usage examples

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Recharts for visualizations
- Axios for API calls

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Build

```bash
# Production build
npm run build

# Start production server
npm start
```

## Docker

See root project `docker-compose.yml` for full-stack deployment.

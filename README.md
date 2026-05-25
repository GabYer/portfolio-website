# 🌐 portfolio.gabyer.dev

> **Live data engineering portfolio website** — real-time crypto prices, forex rates,
> Kazakhstan news, and animated pipeline visualization.
> Built with Next.js, powered by a homelab data platform.

[![Deploy](https://img.shields.io/badge/Deployed-portfolio.gabyer.dev-black?logo=vercel)](https://portfolio.gabyer.dev)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org)
[![Vercel](https://img.shields.io/badge/Hosted-Vercel-black?logo=vercel)](https://vercel.com)
[![Data](https://img.shields.io/badge/Data-gabyer.dev-orange?logo=cloudflare)](https://gabyer.dev)

---

## 🖥️ Live Demo

**[portfolio.gabyer.dev](https://portfolio.gabyer.dev)**

---

## 📄 Pages

| Page | Description |
|------|-------------|
| `/` | Animated pipeline visualization — data flow from sources to storage |
| `/trading` | Live crypto prices (USD) + 30-day price history in KZT |
| `/analytics` | Forex rates (NBK Kazakhstan) + Tengrinews.kz news feed |
| `/about` | Tech stack, architecture, links to live services |

---

## 🏗️ Architecture

```
PostgreSQL DWH (Neon.tech)
        │
        ├── staging.stg_crypto_prices   ← CoinGecko API (every 6h)
        ├── staging.stg_forex_rates     ← NBK Kazakhstan (every 6h)
        ├── staging.stg_news            ← Tengrinews.kz scraping (every 6h)
        ├── mart.mart_daily_crypto_kzt  ← dbt view (USD + KZT prices)
        └── mart.mart_forex_trend       ← dbt view (rates + day change)
                │
                ▼
        Next.js API Routes (/api/*)
                │
                ▼
        React Components (client-side)
                │
                ▼
        portfolio.gabyer.dev (Vercel CDN)
```

Data is ingested by a separate homelab pipeline:
→ [github.com/GabYer/de-portfolio](https://github.com/GabYer/de-portfolio)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | PostgreSQL 16 (Neon.tech) |
| Deploy | Vercel |
| Domain | portfolio.gabyer.dev (Cloudflare) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL connection string (Neon.tech)

### Local Development

```bash
git clone https://github.com/GabYer/portfolio-website
cd portfolio-website
npm install
```

Create `.env.local`:
```
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-empty-base-alumbcid-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📡 API Routes

| Endpoint | Source Table | Description |
|----------|-------------|-------------|
| `/api/crypto` | `staging.stg_crypto_prices` | Latest crypto prices |
| `/api/crypto-kzt` | `mart.mart_daily_crypto_kzt` | 30-day price history in KZT |
| `/api/forex` | `staging.stg_forex_rates` | Latest forex rates (NBK) |
| `/api/forex-trend` | `mart.mart_forex_trend` | Forex trend with day change |
| `/api/news` | `staging.stg_news` | Latest Kazakhstan news |

---

## 🔄 Deployment

Auto-deploys on every push to `main` via Vercel.

```
git push origin main → Vercel build → portfolio.gabyer.dev
```

### Environment Variables (Vercel)

```
DATABASE_URL    PostgreSQL connection string (Neon.tech)
```

---

## 🔗 Related

- **Data Pipeline**: [github.com/GabYer/de-portfolio](https://github.com/GabYer/de-portfolio)
- **Grafana**: [grafana.gabyer.dev](https://grafana.gabyer.dev)
- **Airflow**: [airflow.gabyer.dev](https://airflow.gabyer.dev)

---

## 👤 Author

**GabYer** — Data Engineer, Astana, Kazakhstan

[![GitHub](https://img.shields.io/badge/GitHub-GabYer-black?logo=github)](https://github.com/GabYer)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-gabyer-blue?logo=linkedin)](https://www.linkedin.com/in/gabyer/)
[![Email](https://img.shields.io/badge/Email-gyermekbayev@gmail.com-red?logo=gmail)](mailto:gyermekbayev@gmail.com)

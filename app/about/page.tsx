import { GitBranch, ExternalLink } from "lucide-react";

const stack = [
  {
    group: "Homelab",
    color: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
    items: [
      { label: "OS",      value: "Ubuntu 24.04 LTS" },
      { label: "CPU",     value: "Intel Core i5" },
      { label: "RAM",     value: "16 GB DDR4" },
      { label: "Storage", value: "500 GB SSD" },
      { label: "Network", value: "Tailscale VPN mesh" },
    ],
  },
  {
    group: "Data Services",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    items: [
      { label: "Orchestration", value: "Apache Airflow 2.9" },
      { label: "Streaming",     value: "Apache Kafka" },
      { label: "OLAP",          value: "ClickHouse" },
      { label: "OLTP",          value: "PostgreSQL 16 (Neon)" },
      { label: "Transform",     value: "dbt Core" },
    ],
  },
  {
    group: "BI & Monitoring",
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/5",
    items: [
      { label: "Dashboards",    value: "Grafana" },
      { label: "BI Analytics",  value: "Apache Superset" },
      { label: "CI/CD",         value: "GitHub Actions" },
      { label: "Containers",    value: "Docker / Docker Compose" },
    ],
  },
  {
    group: "Data Sources",
    color: "text-green-400",
    border: "border-green-500/30",
    bg: "bg-green-500/5",
    items: [
      { label: "Crypto prices",  value: "CoinGecko REST API" },
      { label: "Forex rates",    value: "NBK Kazakhstan API" },
      { label: "Weather",        value: "Open-Meteo API" },
      { label: "News",           value: "Tengrinews scraping" },
      { label: "Trades",         value: "Binance WebSocket (25M+ rows)" },
    ],
  },
];

const services = [
  { label: "Grafana Dashboards",  href: "https://grafana.gabyer.dev",    color: "text-purple-400 border-purple-500/40" },
  { label: "Kafka UI",            href: "https://kafka.gabyer.dev",       color: "text-blue-400 border-blue-500/40"    },
  { label: "Airflow",             href: "https://airflow.gabyer.dev",     color: "text-blue-400 border-blue-500/40"    },
  { label: "ClickHouse",          href: "https://clickhouse.gabyer.dev",  color: "text-green-400 border-green-500/40"  },
  { label: "de-portfolio repo",   href: "https://github.com/GabYer/de-portfolio", color: "text-slate-300 border-slate-500/40" },
  { label: "portfolio-website",   href: "https://github.com/GabYer/portfolio-website", color: "text-slate-300 border-slate-500/40" },
];

const pipeline = [
  { step: "1", label: "Ingest",     desc: "APIs polled by Airflow DAGs every 15–60 min. Binance WebSocket streams to Kafka in real time." },
  { step: "2", label: "Stream",     desc: "Kafka topics buffer raw trade data. ClickHouse consumer writes 25M+ rows directly from broker." },
  { step: "3", label: "Transform",  desc: "dbt models build staging → mart layers in Neon PostgreSQL. Idempotent, tested, documented." },
  { step: "4", label: "Visualize",  desc: "Grafana reads ClickHouse for low-latency metrics. Superset queries PostgreSQL for BI reports." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-12">

      {/* Hero */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm text-orange-400">
          About this project
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          DE Portfolio — a real data platform
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
          This portfolio is not mockups — it is a live homelab running
          a production-grade data engineering stack. Every chart, table
          and metric on this site comes from actual pipelines processing
          real financial and market data.
        </p>
        <div className="flex gap-3 flex-wrap">
          <a
            href="https://github.com/GabYer/de-portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-sm text-white transition-colors"
          >
            <GitBranch className="h-4 w-4" />
            de-portfolio (pipelines)
          </a>
          <a
            href="https://github.com/GabYer/portfolio-website"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-sm text-white transition-colors"
          >
            <GitBranch className="h-4 w-4" />
            portfolio-website (this site)
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">How the pipeline works</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {pipeline.map(({ step, label, desc }) => (
            <div key={step} className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-5 flex gap-4">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-sm font-bold text-orange-400">
                {step}
              </div>
              <div>
                <p className="font-semibold text-white mb-1">{label}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">Tech Stack</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {stack.map(({ group, color, border, bg, items }) => (
            <div key={group} className={`rounded-2xl border ${border} ${bg} p-5 space-y-3`}>
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${color}`}>{group}</h3>
              <div className="space-y-2">
                {items.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-200 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">Live services</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {services.map(({ label, href, color }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between rounded-xl border px-4 py-3 bg-[#1a1f2e] hover:scale-105 transition-all ${color}`}
            >
              <span className="text-sm font-medium">{label}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
          ))}
        </div>
      </section>

      {/* DB schema */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">PostgreSQL Schema</h2>
        <div className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-5 space-y-4">
          {[
            {
              schema: "staging",
              tables: [
                { name: "stg_crypto_prices", cols: "coin_id, symbol, current_price_usd, price_change_pct_24h, market_cap_usd" },
                { name: "stg_forex_rates",   cols: "currency_code, rate_kzt, units, rate_date" },
                { name: "stg_news",          cols: "title, category, published_at, url" },
              ],
            },
            {
              schema: "mart",
              tables: [
                { name: "mart_daily_crypto_kzt", cols: "trade_date, symbol, avg_price_usd, avg_price_kzt" },
                { name: "mart_forex_trend",      cols: "rate_date, currency_code, rate_per_unit, day_change" },
              ],
            },
          ].map(({ schema, tables }) => (
            <div key={schema}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{schema} schema</p>
              {tables.map(({ name, cols }) => (
                <div key={name} className="mb-2 rounded-lg bg-slate-900 px-4 py-3 border border-slate-800">
                  <p className="text-sm font-mono text-green-400 mb-1">{schema}.{name}</p>
                  <p className="text-xs font-mono text-slate-500">{cols}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

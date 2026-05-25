import PipelineViz from "@/components/PipelineViz";
import { GitBranch, Server, Cpu, Database, Activity } from "lucide-react";

const stats = [
  { label: "Binance trades", value: "25M+", icon: Activity, color: "text-orange-400" },
  { label: "API sources",    value: "6",    icon: Database,  color: "text-blue-400"  },
  { label: "Uptime",         value: "99.9%",icon: Server,    color: "text-green-400" },
  { label: "RAM homelab",    value: "16 GB",icon: Cpu,       color: "text-purple-400"},
];

const techLinks = [
  { label: "Grafana",    href: "https://grafana.gabyer.dev",    color: "border-purple-500/40 text-purple-400" },
  { label: "Kafka",      href: "https://kafka.gabyer.dev",      color: "border-blue-500/40 text-blue-400"    },
  { label: "Airflow",    href: "https://airflow.gabyer.dev",    color: "border-blue-500/40 text-blue-400"    },
  { label: "ClickHouse", href: "https://clickhouse.gabyer.dev", color: "border-green-500/40 text-green-400"  },
  { label: "de-portfolio on GitHub", href: "https://github.com/GabYer/de-portfolio", color: "border-slate-500/40 text-slate-300" },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-12">

      {/* Hero */}
      <section className="text-center space-y-4 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm text-orange-400">
          <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
          Live data pipelines — running 24/7
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Senior Data Engineer
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 text-lg leading-relaxed">
          End-to-end data platform on a homelab — Kafka streams, Airflow DAGs, dbt models,
          ClickHouse OLAP and live Grafana dashboards. Everything you see is real data.
        </p>
        <div className="flex justify-center gap-3 flex-wrap pt-2">
          <a
            href="https://github.com/GabYer/de-portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 text-sm font-medium text-white transition-colors"
          >
            <GitBranch className="h-4 w-4" />
            View source
          </a>
          <a
            href="https://grafana.gabyer.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-sm font-medium text-white transition-colors"
          >
            Open Grafana
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-5 flex flex-col gap-2">
            <Icon className={`h-5 w-5 ${color}`} />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </section>

      {/* Pipeline */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Data Pipeline Architecture</h2>
          <span className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs text-green-400 border border-green-500/30">
            Live
          </span>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-6 overflow-x-auto">
          <PipelineViz />
        </div>
      </section>

      {/* Services */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">Services</h2>
        <div className="flex flex-wrap gap-3">
          {techLinks.map(({ label, href, color }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:scale-105 ${color} bg-[#1a1f2e]`}
            >
              {label} ↗
            </a>
          ))}
        </div>
      </section>

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Newspaper, TrendingUp, TrendingDown, DollarSign, RefreshCw } from "lucide-react";

const ForexChart = dynamic(() => import("@/components/ForexChart"), {
  ssr: false,
  loading: () => (
    <div className="h-56 flex items-center justify-center">
      <RefreshCw className="h-6 w-6 text-slate-600 animate-spin" />
    </div>
  ),
});

interface ForexRow {
  currency_code: string;
  rate_kzt: number;
  units: number;
  rate_date: string;
}

interface TrendRow {
  rate_date: string;
  currency_code: string;
  rate_per_unit: number;
  day_change: number;
}

interface NewsRow {
  title: string;
  category: string;
  published_at: string;
  url: string;
}

const CURRENCIES = ["USD", "EUR", "RUB", "CNY", "GBP"];

const CATEGORY_COLORS: Record<string, string> = {
  crypto:  "bg-orange-500/20 text-orange-400 border-orange-500/30",
  forex:   "bg-blue-500/20   text-blue-400   border-blue-500/30",
  news:    "bg-slate-500/20  text-slate-400  border-slate-500/30",
  economy: "bg-green-500/20  text-green-400  border-green-500/30",
};

function getCategoryClass(cat: string) {
  return CATEGORY_COLORS[cat?.toLowerCase()] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30";
}

function timeAgo(dt: string) {
  const diff = Date.now() - new Date(dt).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AnalyticsPage() {
  const [forex,  setForex]  = useState<ForexRow[]>([]);
  const [trend,  setTrend]  = useState<TrendRow[]>([]);
  const [news,   setNews]   = useState<NewsRow[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [fRes, tRes, nRes] = await Promise.all([
          fetch("/api/forex"),
          fetch("/api/forex-trend"),
          fetch("/api/news"),
        ]);
        const [fJson, tJson, nJson] = await Promise.all([
          fRes.json(), tRes.json(), nRes.json(),
        ]);
        setForex(fJson.data  ?? []);
        setTrend(tJson.data  ?? []);
        setNews(nJson.data   ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const latestForex = CURRENCIES.map((code) => {
    const row = forex.find((r) => r.currency_code === code);
    return { code, rate: row ? row.rate_kzt / (row.units || 1) : null };
  });

  const chartData = trend
    .filter((r) => r.currency_code === selectedCurrency)
    .slice()
    .reverse()
    .slice(-30);

  const lastPoint   = chartData[chartData.length - 1];
  const dayChangeUp = (lastPoint?.day_change ?? 0) >= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">
          Forex rates from NBK Kazakhstan · News from Tengrinews
        </p>
      </div>

      {/* Forex rate cards */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-300">
          <DollarSign className="h-4 w-4 text-blue-400" />
          Forex Rates to KZT
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {loading
            ? Array(5).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-4 animate-pulse h-20" />
              ))
            : latestForex.map(({ code, rate }) => (
                <button
                  key={code}
                  onClick={() => setSelectedCurrency(code)}
                  className={`rounded-2xl border p-4 text-left transition-all hover:scale-105 ${
                    selectedCurrency === code
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-slate-800 bg-[#1a1f2e] hover:border-slate-700"
                  }`}
                >
                  <p className="text-xs text-slate-500 mb-1">{code} / KZT</p>
                  <p className="text-lg font-bold text-white">
                    {rate != null ? `₸ ${rate.toFixed(2)}` : "—"}
                  </p>
                </button>
              ))}
        </div>
      </section>

      {/* Trend chart */}
      <section className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-white">{selectedCurrency}/KZT — 30-day trend</h2>
            <p className="text-slate-500 text-xs mt-0.5">mart.mart_forex_trend</p>
          </div>
          {!loading && lastPoint && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${dayChangeUp ? "text-green-400" : "text-red-400"}`}>
              {dayChangeUp
                ? <TrendingUp className="h-4 w-4" />
                : <TrendingDown className="h-4 w-4" />}
              {dayChangeUp ? "+" : ""}{Number(lastPoint.day_change).toFixed(2)} KZT today
            </div>
          )}
        </div>

        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <RefreshCw className="h-6 w-6 text-slate-600 animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-slate-500 text-sm">
            No trend data for {selectedCurrency}
          </div>
        ) : (
          <ForexChart data={chartData} />
        )}
      </section>

      {/* News feed */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-300">
          <Newspaper className="h-4 w-4 text-orange-400" />
          Latest News
          <span className="text-xs text-slate-500 font-normal">staging.stg_news</span>
        </h2>
        <div className="space-y-2">
          {loading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-[#1a1f2e] p-4 animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-800 rounded w-1/4" />
                </div>
              ))
            : news.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-slate-800 bg-[#1a1f2e] p-4 hover:border-slate-700 hover:bg-slate-800/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-slate-200 leading-snug line-clamp-2 flex-1">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.category && (
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${getCategoryClass(item.category)}`}>
                          {item.category}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">{timeAgo(item.published_at)}</span>
                    </div>
                  </div>
                </a>
              ))}
        </div>
      </section>

    </div>
  );
}

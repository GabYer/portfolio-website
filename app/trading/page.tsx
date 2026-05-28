"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

// Dynamically import recharts-based component — disables SSR to avoid
// "window is not defined" hydration errors in Next.js App Router.
const CryptoChart = dynamic(() => import("@/components/CryptoChart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <RefreshCw className="h-6 w-6 text-slate-600 animate-spin" />
    </div>
  ),
});

interface CryptoRow {
  coin_id: string;
  symbol: string;
  current_price_usd: number;
  price_change_pct_24h: number;
  market_cap_usd: number;
  // any timestamp column the table might have
  updated_at?: string;
  loaded_at?: string;
  fetched_at?: string;
  created_at?: string;
  price_timestamp?: string;
  last_updated?: string;
  [key: string]: unknown;
}

interface KztRow {
  trade_date: string;
  symbol: string;
  avg_price_usd: number;
  avg_price_kzt: number;
}

const SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "ADA"];

/** Postgres returns numerics as strings — coerce safely */
function toNum(v: unknown): number {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

function fmtPrice(v: unknown) {
  const n = toNum(v);
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtCap(v: unknown) {
  const n = toNum(v);
  if (n >= 1_000_000_000) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1_000_000)     return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

export default function TradingPage() {
  const [cryptos, setCryptos]           = useState<CryptoRow[]>([]);
  const [chartData, setChartData]       = useState<KztRow[]>([]);
  const [selectedSymbol, setSelected]   = useState("BTC");
  const [loading, setLoading]           = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [lastUpdate, setLastUpdate]     = useState<Date | null>(null);
  const [dataTs, setDataTs]             = useState<string | null>(null); // timestamp from DB row
  const [error, setError]               = useState<string | null>(null);

  async function loadCryptos() {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/crypto");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "API error");
      const rows: CryptoRow[] = json.data ?? [];
      setCryptos(rows);
      setLastUpdate(new Date());

      // Pick the first timestamp-like column from the first row
      const TS_COLS = ["updated_at","loaded_at","fetched_at","created_at","price_timestamp","last_updated"];
      if (rows.length > 0) {
        for (const col of TS_COLS) {
          if (rows[0][col]) { setDataTs(String(rows[0][col])); break; }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function loadChart(sym: string) {
    setChartLoading(true);
    try {
      const res  = await fetch(`/api/crypto-kzt?symbol=${sym}`);
      const json = await res.json();
      setChartData((json.data ?? []).slice().reverse());
    } finally {
      setChartLoading(false);
    }
  }

  useEffect(() => { loadCryptos(); }, []);
  useEffect(() => { loadChart(selectedSymbol); }, [selectedSymbol]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Crypto Trading</h1>
          <p className="text-slate-400 text-sm mt-1">
            Live prices from CoinGecko via PostgreSQL
            {lastUpdate && ` · Fetched ${lastUpdate.toLocaleTimeString("ru-KZ", { timeZone: "Asia/Almaty" })}`}
          </p>
          {dataTs && (
            <p className="text-slate-500 text-xs mt-0.5">
              Data timestamp: {new Date(dataTs).toLocaleString("ru-KZ", { timeZone: "Asia/Almaty" })}
            </p>
          )}
        </div>
        <button
          onClick={loadCryptos}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* KZT chart — top */}
      <div className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Price in KZT — 30-day history</h2>
            <p className="text-slate-500 text-xs mt-0.5">mart.mart_daily_crypto_kzt</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SYMBOLS.map((s) => (
              <button
                key={s}
                onClick={() => setSelected(s)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedSymbol === s
                    ? "bg-orange-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {chartLoading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="h-6 w-6 text-slate-600 animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            No data for {selectedSymbol}
          </div>
        ) : (
          <CryptoChart data={chartData} />
        )}
      </div>

      {/* Price table — below chart */}
      <div className="rounded-2xl border border-slate-800 bg-[#1a1f2e] overflow-hidden">
        <div className="grid grid-cols-4 text-xs text-slate-500 uppercase tracking-wider px-5 py-3 border-b border-slate-800">
          <span>Asset</span>
          <span className="text-right">Price</span>
          <span className="text-right">24h Change</span>
          <span className="text-right">Market Cap</span>
        </div>

        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="grid grid-cols-4 px-5 py-4 border-b border-slate-800/50 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-20" />
              <div className="h-4 bg-slate-700 rounded w-24 ml-auto" />
              <div className="h-4 bg-slate-700 rounded w-16 ml-auto" />
              <div className="h-4 bg-slate-700 rounded w-20 ml-auto" />
            </div>
          ))
        ) : cryptos.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-500 text-sm">
            No data — check DATABASE_URL in Vercel environment variables
          </div>
        ) : (
          cryptos.map((c) => {
            const change = toNum(c.price_change_pct_24h);
            const up = change >= 0;

            // Find whichever timestamp column exists in this row
            const TS_COLS = ["updated_at","loaded_at","fetched_at","created_at","price_timestamp","last_updated"];
            const rowTs = TS_COLS.map(k => c[k]).find(v => v != null);

            return (
              <div
                key={c.coin_id}
                className="grid grid-cols-4 px-5 py-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {c.symbol?.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.symbol}</p>
                    <p className="text-xs text-slate-500 capitalize">{c.coin_id}</p>
                    {rowTs && (
                      <p className="text-[10px] text-slate-600 font-mono">
                        {new Date(String(rowTs)).toLocaleString("ru-KZ", { timeZone: "Asia/Almaty" })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right self-center">
                  <p className="text-sm font-mono text-white">{fmtPrice(c.current_price_usd)}</p>
                </div>

                <div className="flex items-center justify-end gap-1 self-center">
                  {up
                    ? <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                    : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                  <span className={`text-sm font-medium ${up ? "text-green-400" : "text-red-400"}`}>
                    {up ? "+" : ""}{change.toFixed(2)}%
                  </span>
                </div>

                <div className="text-right self-center text-sm text-slate-400">
                  {c.market_cap_usd ? fmtCap(c.market_cap_usd) : "—"}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

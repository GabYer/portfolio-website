"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface CryptoRow {
  coin_id: string;
  symbol: string;
  current_price_usd: number;
  price_change_pct_24h: number;
  market_cap_usd: number;
}

interface KztRow {
  trade_date: string;
  symbol: string;
  avg_price_usd: number;
  avg_price_kzt: number;
}

const SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "ADA"];

function fmt(n: number, decimals = 2) {
  if (n >= 1_000_000_000) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1_000_000)     return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export default function TradingPage() {
  const [cryptos, setCryptos] = useState<CryptoRow[]>([]);
  const [chartData, setChartData] = useState<KztRow[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  async function loadCryptos() {
    setLoading(true);
    try {
      const res = await fetch("/api/crypto");
      const json = await res.json();
      setCryptos(json.data ?? []);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }

  async function loadChart(sym: string) {
    setChartLoading(true);
    try {
      const res = await fetch(`/api/crypto-kzt?symbol=${sym}`);
      const json = await res.json();
      // reverse so oldest→newest on x-axis
      setChartData((json.data ?? []).reverse());
    } finally {
      setChartLoading(false);
    }
  }

  useEffect(() => { loadCryptos(); }, []);
  useEffect(() => { loadChart(selectedSymbol); }, [selectedSymbol]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-slate-700 bg-[#1a1f2e] p-3 text-sm shadow-xl">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-white font-bold">{fmt(payload[0].value)} USD</p>
        {payload[1] && (
          <p className="text-orange-400">{fmt(payload[1].value, 0)} KZT</p>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Crypto Trading</h1>
          <p className="text-slate-400 text-sm mt-1">
            Live prices from CoinGecko via PostgreSQL · {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : "Loading…"}
          </p>
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

      {/* Price table */}
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
        ) : (
          cryptos.map((c) => {
            const up = c.price_change_pct_24h >= 0;
            return (
              <div
                key={c.coin_id}
                className="grid grid-cols-4 px-5 py-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {c.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.symbol}</p>
                    <p className="text-xs text-slate-500 capitalize">{c.coin_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-white">{fmt(c.current_price_usd)}</p>
                </div>
                <div className="flex items-center justify-end gap-1">
                  {up ? <TrendingUp className="h-3.5 w-3.5 text-green-400" /> : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                  <span className={`text-sm font-medium ${up ? "text-green-400" : "text-red-400"}`}>
                    {up ? "+" : ""}{c.price_change_pct_24h?.toFixed(2)}%
                  </span>
                </div>
                <div className="text-right text-sm text-slate-400">
                  {c.market_cap_usd ? fmt(c.market_cap_usd) : "—"}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* KZT chart */}
      <div className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Price in KZT — 30-day history</h2>
            <p className="text-slate-500 text-xs mt-0.5">mart.mart_daily_crypto_kzt</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SYMBOLS.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSymbol(s)}
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
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradUsd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gradKzt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="trade_date"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={v => v?.slice(5)}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="usd"
                orientation="left"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="kzt"
                orientation="right"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `₸${(v/1_000_000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="usd"
                type="monotone"
                dataKey="avg_price_usd"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#gradUsd)"
                name="USD"
              />
              <Area
                yAxisId="kzt"
                type="monotone"
                dataKey="avg_price_kzt"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradKzt)"
                name="KZT"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}

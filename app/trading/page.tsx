"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { RefreshCw, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { SYMBOL_LABELS, CH_SYMBOLS } from "@/lib/clickhouse";
import type { VwapRow, BuySellRow, OhlcvRow } from "@/types/trading";

/* ── dynamic imports (recharts needs browser APIs) ── */
const VwapChart = dynamic(() => import("@/components/VwapChart"), {
  ssr: false,
  loading: () => <ChartSkeleton height={280} />,
});
const BuySellChart = dynamic(() => import("@/components/BuySellChart"), {
  ssr: false,
  loading: () => <ChartSkeleton height={160} />,
});

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <RefreshCw className="h-5 w-5 text-slate-600 animate-spin" />
    </div>
  );
}

/* ── helpers ── */
function fmtUsd(v: number) {
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtVol(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(2)}K`;
  return v.toFixed(4);
}

function fmtTime(v: string) {
  try {
    return new Date(v).toLocaleTimeString("ru-KZ", {
      timeZone: "Asia/Almaty",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return v; }
}

type Symbol = (typeof CH_SYMBOLS)[number];

/* ═══════════════════════════════════════ */
export default function TradingPage() {
  const [symbol, setSymbol]           = useState<Symbol>("BTCUSDT");
  const [vwap,   setVwap]             = useState<VwapRow[]>([]);
  const [buysell, setBuysell]         = useState<BuySellRow[]>([]);
  const [ohlcv,  setOhlcv]            = useState<OhlcvRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error,   setError]           = useState<string | null>(null);
  const [updatedAt, setUpdatedAt]     = useState<Date | null>(null);

  const load = useCallback(async (sym: Symbol) => {
    setLoading(true);
    setError(null);
    try {
      const [vRes, bRes, tRes] = await Promise.all([
        fetch(`/api/ch-vwap?symbol=${sym}&hours=2`),
        fetch(`/api/ch-buysell?symbol=${sym}&minutes=30`),
        fetch(`/api/ch-trades?symbol=${sym}`),
      ]);

      // Parse JSON safely — if server returns HTML (500 page), give a clear message
      const safeJson = async (res: Response, label: string) => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(`${label} → HTTP ${res.status}: ${text.slice(0, 200)}`);
        }
      };

      const [vJson, bJson, tJson] = await Promise.all([
        safeJson(vRes, "ch-vwap"),
        safeJson(bRes, "ch-buysell"),
        safeJson(tRes, "ch-trades"),
      ]);

      if (!vRes.ok) throw new Error(vJson.error ?? "VWAP fetch failed");
      if (!bRes.ok) throw new Error(bJson.error ?? "Buy/Sell fetch failed");
      if (!tRes.ok) throw new Error(tJson.error ?? "Trades fetch failed");

      setVwap(vJson.data    ?? []);
      setBuysell(bJson.data ?? []);
      setOhlcv(tJson.data   ?? []);
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(symbol); }, [symbol, load]);

  /* ── summary stats from last VWAP row ── */
  const lastVwap  = vwap[vwap.length - 1];
  const firstVwap = vwap[0];
  const priceDiff = lastVwap && firstVwap
    ? lastVwap.vwap - firstVwap.vwap : 0;
  const pricePct  = firstVwap?.vwap
    ? (priceDiff / firstVwap.vwap) * 100 : 0;
  const priceUp   = priceDiff >= 0;

  /* ── buy pressure from last buy/sell row ── */
  const lastBS     = buysell[buysell.length - 1];
  const totalVol   = lastBS ? lastBS.buy_volume + lastBS.sell_volume : 0;
  const buyPct     = totalVol > 0 ? (lastBS!.buy_volume / totalVol) * 100 : 50;
  const buyDom     = buyPct >= 50;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">Binance Live Trading</h1>
            <span className="flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              ClickHouse
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            trading.binance_trades · mv_vwap_1min · mv_buysell_1min
            {updatedAt && (
              <span className="text-slate-500">
                {" "}· Updated {updatedAt.toLocaleTimeString("ru-KZ", { timeZone: "Asia/Almaty" })}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Symbol selector */}
          <div className="flex gap-1.5">
            {CH_SYMBOLS.map((s) => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  symbol === s
                    ? "bg-orange-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                }`}
              >
                {SYMBOL_LABELS[s]}
              </button>
            ))}
          </div>

          <button
            onClick={() => load(symbol)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-sm text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-mono">
          {error}
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Current VWAP */}
        <div className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-4">
          <p className="text-xs text-slate-500 mb-1">VWAP (last)</p>
          <p className="text-xl font-bold text-white font-mono">
            {loading ? "—" : lastVwap ? fmtUsd(lastVwap.vwap) : "No data"}
          </p>
        </div>

        {/* 2h price change */}
        <div className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-4">
          <p className="text-xs text-slate-500 mb-1">2h Change</p>
          <p className={`text-xl font-bold font-mono flex items-center gap-1 ${priceUp ? "text-green-400" : "text-red-400"}`}>
            {loading ? "—" : (
              <>
                {priceUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {priceUp ? "+" : ""}{pricePct.toFixed(2)}%
              </>
            )}
          </p>
        </div>

        {/* Buy pressure */}
        <div className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-4">
          <p className="text-xs text-slate-500 mb-1">Buy pressure (last min)</p>
          <div className="flex items-center gap-2">
            <p className={`text-xl font-bold font-mono ${buyDom ? "text-green-400" : "text-red-400"}`}>
              {loading ? "—" : `${buyPct.toFixed(1)}%`}
            </p>
            <span className={`text-xs ${buyDom ? "text-green-600" : "text-red-600"}`}>
              {buyDom ? "BUY DOM" : "SELL DOM"}
            </span>
          </div>
        </div>

        {/* 1h volume */}
        <div className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-4">
          <p className="text-xs text-slate-500 mb-1">1h Volume</p>
          <p className="text-xl font-bold text-white font-mono">
            {loading ? "—" : ohlcv.length > 0
              ? fmtVol(ohlcv.reduce((s, r) => s + r.volume, 0))
              : "No data"}
          </p>
        </div>
      </div>

      {/* ── VWAP Chart ── */}
      <div className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-6 space-y-3">
        <div>
          <h2 className="text-base font-bold text-white">
            VWAP · {SYMBOL_LABELS[symbol]} · Last 2 hours (1-min)
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">trading.mv_vwap_1min</p>
        </div>
        {loading ? (
          <ChartSkeleton height={280} />
        ) : vwap.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">
            No VWAP data for {symbol}
          </div>
        ) : (
          <VwapChart data={vwap} />
        )}
      </div>

      {/* ── Buy/Sell Chart ── */}
      <div className="rounded-2xl border border-slate-800 bg-[#1a1f2e] p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              Buy / Sell Pressure · Last 30 minutes
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">trading.mv_buysell_1min</p>
          </div>
          {!loading && lastBS && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-green-400">Buy {lastBS.buy_volume.toFixed(3)}</span>
              <span className="text-red-400">Sell {lastBS.sell_volume.toFixed(3)}</span>
            </div>
          )}
        </div>

        {/* pressure bar */}
        {!loading && totalVol > 0 && (
          <div className="flex h-2 rounded-full overflow-hidden">
            <div className="bg-green-500 transition-all" style={{ width: `${buyPct}%` }} />
            <div className="bg-red-500  transition-all" style={{ width: `${100 - buyPct}%` }} />
          </div>
        )}

        {loading ? (
          <ChartSkeleton height={160} />
        ) : buysell.length === 0 ? (
          <div className="h-[160px] flex items-center justify-center text-slate-500 text-sm">
            No buy/sell data for {symbol}
          </div>
        ) : (
          <BuySellChart data={buysell} />
        )}
      </div>

      {/* ── OHLCV Table ── */}
      <div className="rounded-2xl border border-slate-800 bg-[#1a1f2e] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">
            OHLCV · {SYMBOL_LABELS[symbol]} · Last 60 minutes (1-min bars)
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">trading.binance_trades (aggregated)</p>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-7 text-xs text-slate-500 uppercase tracking-wider px-5 py-2 border-b border-slate-800/50">
          <span>Time (Almaty)</span>
          <span className="text-right">Open</span>
          <span className="text-right">High</span>
          <span className="text-right">Low</span>
          <span className="text-right">Close</span>
          <span className="text-right">Volume</span>
          <span className="text-right">Trades</span>
        </div>

        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="grid grid-cols-7 px-5 py-3 border-b border-slate-800/40 animate-pulse gap-3">
              {Array(7).fill(0).map((_, j) => (
                <div key={j} className="h-3.5 bg-slate-700/60 rounded ml-auto w-full" />
              ))}
            </div>
          ))
        ) : ohlcv.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-500 text-sm">
            No OHLCV data for {symbol}
          </div>
        ) : (
          ohlcv.map((row, i) => {
            const up = row.close >= row.open;
            return (
              <div
                key={i}
                className="grid grid-cols-7 px-5 py-3 border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors text-sm font-mono"
              >
                <span className="text-slate-400 text-xs self-center">{fmtTime(row.minute)}</span>
                <span className="text-right text-slate-300">{fmtUsd(row.open)}</span>
                <span className="text-right text-green-400">{fmtUsd(row.high)}</span>
                <span className="text-right text-red-400">{fmtUsd(row.low)}</span>
                <span className={`text-right font-bold ${up ? "text-green-400" : "text-red-400"}`}>
                  {fmtUsd(row.close)}
                </span>
                <span className="text-right text-slate-400">{fmtVol(row.volume)}</span>
                <span className="text-right text-slate-500">{row.trade_count.toLocaleString()}</span>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface KztRow {
  trade_date: string;
  symbol: string;
  avg_price_usd: number | string;
  avg_price_kzt: number | string;
}

/** Postgres returns numerics as strings */
function toNum(v: unknown): number {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

/** Trim Postgres timestamp to YYYY-MM-DD */
function toDate(v: unknown): string {
  return String(v).slice(0, 10);
}

function fmt(v: unknown) {
  const n = toNum(v);
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-[#1a1f2e] p-3 text-sm shadow-xl">
      <p className="text-slate-400 mb-1">{toDate(label)}</p>
      <p className="text-white font-bold">{fmt(payload[0]?.value ?? 0)}</p>
      {payload[1] && (
        <p className="text-orange-400">
          ₸ {Number(payload[1].value).toLocaleString("en-US", { minimumFractionDigits: 0 })}
        </p>
      )}
    </div>
  );
}

export default function CryptoChart({ data }: { data: KztRow[] }) {
  if (!data.length) return null;

  // Coerce string numerics and normalize date format (strip time part)
  const normalized = data.map((r) => ({
    ...r,
    trade_date:    toDate(r.trade_date),   // "2024-01-15T00:00:00.000Z" → "2024-01-15"
    avg_price_usd: toNum(r.avg_price_usd),
    avg_price_kzt: toNum(r.avg_price_kzt),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={normalized} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradUsd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradKzt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="trade_date"
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickFormatter={(v) => toDate(v).slice(5)}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="usd"
          orientation="left"
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <YAxis
          yAxisId="kzt"
          orientation="right"
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₸${(v / 1_000_000).toFixed(1)}M`}
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
  );
}

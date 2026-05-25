"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface TrendRow {
  rate_date: string;
  currency_code: string;
  rate_per_unit: number | string;
  day_change: number | string;
}

/** Postgres returns numerics as strings */
function toNum(v: unknown): number {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const change = toNum(payload[0]?.payload?.day_change);
  return (
    <div className="rounded-xl border border-slate-700 bg-[#1a1f2e] p-3 text-sm shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-white font-bold">
        ₸ {toNum(payload[0].value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>
      <p className={change >= 0 ? "text-green-400" : "text-red-400"}>
        {change >= 0 ? "+" : ""}{change.toFixed(2)} KZT
      </p>
    </div>
  );
}

export default function ForexChart({ data }: { data: TrendRow[] }) {
  if (!data.length) return null;

  // Coerce string numerics from Postgres to actual numbers for recharts
  const normalized = data.map((r) => ({
    ...r,
    rate_per_unit: toNum(r.rate_per_unit),
    day_change:    toNum(r.day_change),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={normalized} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="rate_date"
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickFormatter={(v) => String(v)?.slice(5)}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₸${Number(v).toFixed(0)}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="rate_per_unit"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#3b82f6" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

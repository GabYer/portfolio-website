"use client";

import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

export const CURRENCY_COLORS: Record<string, string> = {
  USD: "#3b82f6",  // blue
  EUR: "#a855f7",  // purple
  RUB: "#ef4444",  // red
  CNY: "#f97316",  // orange
  GBP: "#22c55e",  // green
};

type ChartRow = { rate_date: string } & Record<string, number | string>;

interface Props {
  data:       ChartRow[];
  currencies: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-[#0f1117] p-3 text-sm shadow-xl space-y-1">
      <p className="text-slate-400 text-xs mb-2">{String(label).slice(0, 10)}</p>
      {payload.map((p: { dataKey: string; value: number; color: string }) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.dataKey}  ₸ {Number(p.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

export default function ForexChart({ data, currencies }: Props) {
  if (!data.length || !currencies.length) return null;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="rate_date"
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickFormatter={(v) => String(v).slice(5)}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₸${Number(v).toFixed(0)}`}
          width={54}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => value}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        {currencies.map((code) => (
          <Line
            key={code}
            type="monotone"
            dataKey={code}
            stroke={CURRENCY_COLORS[code] ?? "#94a3b8"}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

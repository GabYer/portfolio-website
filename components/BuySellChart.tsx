"use client";

import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import type { BuySellRow } from "@/types/trading";

function fmtTime(v: unknown) {
  try {
    return new Date(String(v)).toLocaleTimeString("ru-KZ", {
      timeZone: "Asia/Almaty",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return String(v); }
}

interface TooltipPayload { dataKey: string; value: number }
interface TooltipProps { active?: boolean; payload?: TooltipPayload[]; label?: string }
function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const buy  = payload.find((p) => p.dataKey === "buy_volume");
  const sell = payload.find((p) => p.dataKey === "sell_volume");
  const total = (buy?.value ?? 0) + (sell?.value ?? 0);
  const buyPct = total > 0 ? ((buy?.value ?? 0) / total * 100).toFixed(1) : "—";
  return (
    <div className="rounded-xl border border-slate-700 bg-[#0f1117] p-3 text-sm shadow-xl">
      <p className="text-slate-400 mb-2 text-xs">{fmtTime(label)}</p>
      {buy  && <p className="text-green-400">Buy  {Number(buy.value).toFixed(3)} <span className="text-slate-500 text-xs">({buyPct}%)</span></p>}
      {sell && <p className="text-red-400">Sell {Number(sell.value).toFixed(3)}</p>}
    </div>
  );
}

export default function BuySellChart({ data }: { data: BuySellRow[] }) {
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="minute"
          tick={{ fill: "#64748b", fontSize: 10 }}
          tickFormatter={fmtTime}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.toFixed(1)}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => value === "buy_volume" ? "Buy" : "Sell"}
          wrapperStyle={{ fontSize: 11 }}
        />
        <Bar dataKey="buy_volume"  stackId="a" fill="#22c55e" fillOpacity={0.75} radius={[0, 0, 0, 0]} name="buy_volume" />
        <Bar dataKey="sell_volume" stackId="a" fill="#ef4444" fillOpacity={0.75} radius={[2, 2, 0, 0]} name="sell_volume" />
      </BarChart>
    </ResponsiveContainer>
  );
}

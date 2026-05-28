"use client";

import {
  ComposedChart, Area, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import type { VwapRow } from "@/types/trading";

function fmtTime(v: unknown) {
  try {
    return new Date(String(v)).toLocaleTimeString("ru-KZ", {
      timeZone: "Asia/Almaty",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return String(v); }
}

function fmtPrice(v: number) {
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface TooltipPayload { dataKey: string; value: number }
interface TooltipProps { active?: boolean; payload?: TooltipPayload[]; label?: string }
function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const vwap   = payload.find((p) => p.dataKey === "vwap");
  const volume = payload.find((p) => p.dataKey === "total_volume");
  return (
    <div className="rounded-xl border border-slate-700 bg-[#0f1117] p-3 text-sm shadow-xl">
      <p className="text-slate-400 mb-2 text-xs">{fmtTime(label)}</p>
      {vwap   && <p className="text-orange-400 font-bold">VWAP {fmtPrice(vwap.value)}</p>}
      {volume && <p className="text-blue-400 text-xs">Volume {Number(volume.value).toFixed(4)}</p>}
    </div>
  );
}

export default function VwapChart({ data }: { data: VwapRow[] }) {
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradVwap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="minute"
          tick={{ fill: "#64748b", fontSize: 10 }}
          tickFormatter={fmtTime}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        {/* Left axis: price */}
        <YAxis
          yAxisId="price"
          orientation="left"
          tick={{ fill: "#64748b", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={54}
        />
        {/* Right axis: volume */}
        <YAxis
          yAxisId="vol"
          orientation="right"
          tick={{ fill: "#64748b", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.toFixed(1)}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => value === "vwap" ? "VWAP (USD)" : "Volume"}
          wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
        />
        <Bar
          yAxisId="vol"
          dataKey="total_volume"
          fill="#3b82f6"
          fillOpacity={0.3}
          radius={[2, 2, 0, 0]}
          name="Volume"
        />
        <Area
          yAxisId="price"
          type="monotone"
          dataKey="vwap"
          stroke="#f97316"
          strokeWidth={2}
          fill="url(#gradVwap)"
          dot={false}
          activeDot={{ r: 4, fill: "#f97316" }}
          name="vwap"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

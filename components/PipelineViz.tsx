"use client";

import { useRef } from "react";
import { ExternalLink } from "lucide-react";

/* ── types ── */
interface NodeDef {
  id: string;
  label: string;
  sublabel?: string;
  color: string;       // border / glow color (tailwind-safe hex)
  bg: string;
  href?: string;
  col: number;         // column index 0-3
  row: number;         // row index within column
}

/* ── data ── */
const NODES: NodeDef[] = [
  // Sources — col 0
  { id: "coingecko",  label: "CoinGecko",       sublabel: "REST API",         color: "#f97316", bg: "#1c1a14", col: 0, row: 0 },
  { id: "nbk",        label: "NBK Kazakhstan",  sublabel: "Forex rates",      color: "#f97316", bg: "#1c1a14", col: 0, row: 1 },
  { id: "tengri",     label: "Tengrinews",      sublabel: "Web scraping",     color: "#f97316", bg: "#1c1a14", col: 0, row: 2 },
  { id: "binance",    label: "Binance WS",      sublabel: "25M+ trades",      color: "#eab308", bg: "#1c1a14", col: 0, row: 3 },
  { id: "openmeteo",  label: "Open-Meteo",      sublabel: "Weather API",      color: "#f97316", bg: "#1c1a14", col: 0, row: 4 },

  // Processing — col 1
  { id: "kafka",      label: "Apache Kafka",    sublabel: "Message streaming", color: "#3b82f6", bg: "#13182a", col: 1, row: 0, href: "https://kafka.gabyer.dev" },
  { id: "airflow",    label: "Apache Airflow",  sublabel: "Orchestration",    color: "#3b82f6", bg: "#13182a", col: 1, row: 2, href: "https://airflow.gabyer.dev" },
  { id: "dbt",        label: "dbt Core",        sublabel: "Transformations",  color: "#3b82f6", bg: "#13182a", col: 1, row: 4 },

  // Storage — col 2
  { id: "postgres",   label: "PostgreSQL",      sublabel: "Neon cloud",       color: "#22c55e", bg: "#13201a", col: 2, row: 1 },
  { id: "clickhouse", label: "ClickHouse",      sublabel: "OLAP / homelab",   color: "#22c55e", bg: "#13201a", col: 2, row: 3, href: "https://clickhouse.gabyer.dev" },

  // BI — col 3
  { id: "grafana",    label: "Grafana",         sublabel: "Dashboards",       color: "#a855f7", bg: "#1a1328", col: 3, row: 1, href: "https://grafana.gabyer.dev" },
  { id: "superset",   label: "Superset",        sublabel: "BI analytics",     color: "#a855f7", bg: "#1a1328", col: 3, row: 3 },
];

/* which node feeds which */
const EDGES: [string, string][] = [
  ["coingecko", "kafka"], ["coingecko", "airflow"],
  ["nbk",       "airflow"],
  ["tengri",    "airflow"],
  ["binance",   "kafka"],
  ["openmeteo", "airflow"],
  ["kafka",     "clickhouse"],
  ["airflow",   "postgres"],
  ["airflow",   "dbt"],
  ["dbt",       "postgres"],
  ["postgres",  "grafana"],
  ["postgres",  "superset"],
  ["clickhouse","grafana"],
];

const COL_LABELS = ["Sources", "Processing", "Storage", "BI / Viz"];
const COL_COLORS = ["text-orange-400", "text-blue-400", "text-green-400", "text-purple-400"];

const COL_W  = 160;  // node width
const COL_GAP = 120; // gap between columns
const ROW_H  = 80;   // row height
const NODE_H = 54;

function nodeCenter(n: NodeDef) {
  const x = n.col * (COL_W + COL_GAP) + COL_W / 2;
  const y = 60 + n.row * ROW_H + NODE_H / 2;
  return { x, y };
}

export default function PipelineViz() {
  const svgRef = useRef<SVGSVGElement>(null);

  // Total canvas dimensions
  const totalCols = 4;
  const totalRows = 5;
  const svgW = totalCols * (COL_W + COL_GAP) - COL_GAP + 40;
  const svgH = 60 + totalRows * ROW_H + 40;

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: svgW }} className="relative">
        {/* Column headers */}
        <div
          className="grid text-center text-xs font-semibold mb-2"
          style={{
            gridTemplateColumns: Array(4).fill(`${COL_W}px`).join(` ${COL_GAP}px `),
            paddingLeft: "20px",
          }}
        >
          {COL_LABELS.map((l, i) => (
            <span key={l} className={`${COL_COLORS[i]} uppercase tracking-widest`}>
              {l}
            </span>
          ))}
        </div>

        {/* SVG: edges */}
        <svg
          ref={svgRef}
          width={svgW}
          height={svgH}
          className="absolute top-6 left-0 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#475569" />
            </marker>
          </defs>
          {EDGES.map(([from, to]) => {
            const a = NODES.find(n => n.id === from)!;
            const b = NODES.find(n => n.id === to)!;
            const s = nodeCenter(a);
            const e = nodeCenter(b);
            // offset x to right edge of source, left edge of target
            const sx = s.x + COL_W / 2;
            const ex = e.x - COL_W / 2;
            const mx = (sx + ex) / 2;
            const d = `M${sx},${s.y} C${mx},${s.y} ${mx},${e.y} ${ex},${e.y}`;
            return (
              <g key={`${from}-${to}`}>
                <path d={d} stroke="#1e293b" strokeWidth={2} fill="none" />
                <path
                  d={d}
                  stroke="#334155"
                  strokeWidth={2}
                  fill="none"
                  strokeDasharray="8 6"
                  className="flow-dash"
                  markerEnd="url(#arr)"
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        <div className="relative" style={{ height: svgH, zIndex: 1 }}>
          {NODES.map(node => {
            const { x, y } = nodeCenter(node);
            const left = x - COL_W / 2;
            const top  = y - NODE_H / 2 + 6 /* header offset */;

            const inner = (
              <div
                className="pipeline-node absolute flex flex-col justify-center px-3 py-2 rounded-xl border cursor-pointer select-none"
                style={{
                  left,
                  top,
                  width: COL_W,
                  height: NODE_H,
                  borderColor: node.color + "55",
                  background: node.bg,
                  boxShadow: `0 0 12px ${node.color}22`,
                }}
              >
                <p className="text-xs font-bold text-white truncate">{node.label}</p>
                {node.sublabel && (
                  <p className="text-[10px] truncate" style={{ color: node.color + "cc" }}>
                    {node.sublabel}
                  </p>
                )}
                {node.href && (
                  <ExternalLink className="absolute right-2 top-2 h-3 w-3 opacity-40" style={{ color: node.color }} />
                )}
                <div
                  className="absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full animate-pulse"
                  style={{ background: node.color }}
                />
              </div>
            );

            if (node.href) {
              return (
                <a key={node.id} href={node.href} target="_blank" rel="noopener noreferrer">
                  {inner}
                </a>
              );
            }
            return <div key={node.id}>{inner}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

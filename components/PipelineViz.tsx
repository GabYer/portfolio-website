"use client";

import { ExternalLink } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
interface NodeDef {
  id: string; label: string; sublabel?: string;
  color: string; bg: string;
  href?: string;
  col: number; row: number;   // row can be fractional
  live?: boolean;
}

type EdgeType = "batch" | "stream" | "process";
interface EdgeDef {
  from: string; to: string;
  type: EdgeType;
  delay?: number;             // stagger offset for batch pulses (seconds)
}

/* ─────────────────────────────────────────────────────────────
   Layout constants
───────────────────────────────────────────────────────────── */
const COL_W  = 160;   // node width
const COL_GAP = 120;  // horizontal gap between columns
const ROW_H  = 80;    // vertical row pitch
const NODE_H = 54;    // node box height
const HDR_H  = 34;    // space reserved for column headers inside SVG

const SVG_W = 4 * (COL_W + COL_GAP) - COL_GAP + 40;          // 1040
const SVG_H = HDR_H + 5 * ROW_H + 40;                         //  474

/* ─────────────────────────────────────────────────────────────
   Node data
   Sources   col 0  rows 0–4   (evenly spaced)
   Processing col 1  rows 1–3   (centred in 5-row span)
   Storage   col 2  rows 1.5–2.5 (vertically centred)
   BI / Viz  col 3  rows 1–3   (centred)
───────────────────────────────────────────────────────────── */
const NODES: NodeDef[] = [
  // Sources
  { id:"coingecko",  label:"CoinGecko",      sublabel:"REST API",          color:"#f97316", bg:"#1c1a14", col:0, row:0 },
  { id:"nbk",        label:"NBK Kazakhstan", sublabel:"Forex rates",       color:"#f97316", bg:"#1c1a14", col:0, row:1 },
  { id:"tengri",     label:"Tengrinews",     sublabel:"Web scraping",      color:"#f97316", bg:"#1c1a14", col:0, row:2 },
  { id:"binance",    label:"Binance WS",     sublabel:"25M+ trades",       color:"#eab308", bg:"#1c1a14", col:0, row:3, live:true },
  { id:"openmeteo",  label:"Open-Meteo",     sublabel:"Weather API",       color:"#f97316", bg:"#1c1a14", col:0, row:4 },
  // Processing
  { id:"kafka",    label:"Apache Kafka",   sublabel:"Message streaming", color:"#3b82f6", bg:"#13182a", col:1, row:1, href:"https://kafka.gabyer.dev" },
  { id:"airflow",  label:"Apache Airflow", sublabel:"Orchestration",     color:"#3b82f6", bg:"#13182a", col:1, row:2, href:"https://airflow.gabyer.dev" },
  { id:"dbt",      label:"dbt Core",       sublabel:"Transformations",   color:"#3b82f6", bg:"#13182a", col:1, row:3 },
  // Storage
  { id:"postgres",   label:"PostgreSQL",  sublabel:"Neon cloud",     color:"#22c55e", bg:"#13201a", col:2, row:1.5 },
  { id:"clickhouse", label:"ClickHouse",  sublabel:"OLAP / homelab", color:"#22c55e", bg:"#13201a", col:2, row:2.5, href:"https://clickhouse.gabyer.dev" },
  // BI / Viz
  { id:"grafana",   label:"Grafana",       sublabel:"Dashboards",    color:"#a855f7", bg:"#1a1328", col:3, row:1, href:"https://grafana.gabyer.dev" },
  { id:"superset",  label:"Superset",      sublabel:"BI analytics",  color:"#a855f7", bg:"#1a1328", col:3, row:2 },
  { id:"portfolio", label:"Portfolio Web", sublabel:"gabyer.dev",    color:"#06b6d4", bg:"#0d1f24", col:3, row:3, href:"https://portfolio.gabyer.dev" },
];

/* ─────────────────────────────────────────────────────────────
   Edge data
───────────────────────────────────────────────────────────── */
const EDGES: EdgeDef[] = [
  // batch sources — staggered 0.8 s apart so pulses don't overlap
  { from:"coingecko",  to:"kafka",      type:"batch",   delay:0   },
  { from:"coingecko",  to:"airflow",    type:"batch",   delay:0.8 },
  { from:"nbk",        to:"airflow",    type:"batch",   delay:1.6 },
  { from:"tengri",     to:"airflow",    type:"batch",   delay:2.4 },
  { from:"openmeteo",  to:"airflow",    type:"batch",   delay:3.2 },
  // WebSocket stream — continuous
  { from:"binance",    to:"kafka",      type:"stream"             },
  // internal processing connections
  { from:"kafka",      to:"clickhouse", type:"process"            },
  { from:"airflow",    to:"postgres",   type:"process"            },
  { from:"airflow",    to:"dbt",        type:"process"            },
  { from:"dbt",        to:"postgres",   type:"process"            },
  { from:"postgres",   to:"grafana",    type:"process"            },
  { from:"postgres",   to:"superset",   type:"process"            },
  { from:"postgres",   to:"portfolio",  type:"process"            },
  { from:"clickhouse", to:"grafana",    type:"process"            },
  { from:"clickhouse", to:"portfolio",  type:"process"            },
];

const COL_META = [
  { label:"SOURCES",    color:"#f97316" },
  { label:"PROCESSING", color:"#3b82f6" },
  { label:"STORAGE",    color:"#22c55e" },
  { label:"BI / VIZ",   color:"#a855f7" },
];

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
function nodeCenter(n: NodeDef) {
  return {
    x: n.col * (COL_W + COL_GAP) + COL_W / 2,
    y: HDR_H + n.row * ROW_H + NODE_H / 2,
  };
}

function makePath(fromId: string, toId: string): string {
  const a = NODES.find(n => n.id === fromId)!;
  const b = NODES.find(n => n.id === toId)!;
  const s = nodeCenter(a), e = nodeCenter(b);
  const sx = s.x + COL_W / 2;
  const ex = e.x - COL_W / 2;
  const mx = (sx + ex) / 2;
  return `M${sx},${s.y} C${mx},${s.y} ${mx},${e.y} ${ex},${e.y}`;
}

// Cast helper — lets us pass SMIL attributes without TypeScript complaints
// about missing props in React's SVG type definitions
const smil = (p: Record<string, string | number>) =>
  p as unknown as React.SVGProps<SVGElement>;

/* ─────────────────────────────────────────────────────────────
   Animation particles
───────────────────────────────────────────────────────────── */

/** One dot that travels the path once every 6 s, then hides */
function BatchParticle({ path, color, delay }: { path:string; color:string; delay:number }) {
  const d = `${delay.toFixed(1)}s`;
  return (
    <circle r="3.5" fill={color}>
      {/* move: 0→1 in the first 25 % of the 6-second cycle, then hold */}
      <animateMotion {...smil({
        path, dur:"6s", repeatCount:"indefinite", begin:d,
        calcMode:"spline",
        keyPoints:"0;1;1", keyTimes:"0;0.25;1",
        keySplines:"0.4 0 0.2 1;0 0 0 0",
      })} />
      {/* opacity: flash in, stay, flash out, invisible for the rest */}
      <animate {...smil({
        attributeName:"opacity",
        values:"0;1;1;0;0",
        keyTimes:"0;0.02;0.23;0.25;1",
        dur:"6s", repeatCount:"indefinite", begin:d,
      })} />
    </circle>
  );
}

/** Four evenly-spaced particles flowing continuously (Binance WS) */
function StreamParticles({ path }: { path:string }) {
  return (
    <>
      {[0, 0.5, 1.0, 1.5].map((offset) => {
        const d = `${offset.toFixed(2)}s`;
        return (
          <circle key={offset} r="3" fill="#fbbf24">
            <animateMotion {...smil({
              path, dur:"2s", repeatCount:"indefinite", begin:d,
              calcMode:"spline",
              keyPoints:"0;1", keyTimes:"0;1",
              keySplines:"0.25 0.1 0.25 1",
            })} />
            <animate {...smil({
              attributeName:"opacity",
              values:"0;1;1;0",
              keyTimes:"0;0.06;0.85;1",
              dur:"2s", repeatCount:"indefinite", begin:d,
            })} />
          </circle>
        );
      })}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */
export default function PipelineViz() {
  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: SVG_W + 4 }} className="relative">

        {/* ── SVG layer: headers + edges + particles ── */}
        <svg width={SVG_W} height={SVG_H} className="block">
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#475569" />
            </marker>
            {/* soft glow for the Binance stream line */}
            <filter id="glow-ws" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Column headers */}
          {COL_META.map(({ label, color }, i) => (
            <text
              key={i}
              x={i * (COL_W + COL_GAP) + COL_W / 2}
              y={18}
              textAnchor="middle"
              fill={color}
              fontSize="10"
              fontWeight="700"
              letterSpacing="1.5"
              style={{ fontFamily:"ui-sans-serif, system-ui, sans-serif", textTransform:"uppercase" } as React.CSSProperties}
            >
              {label}
            </text>
          ))}

          {/* Shadow strokes (depth) */}
          {EDGES.map(({ from, to, type }) => (
            <path
              key={`sh-${from}-${to}`}
              d={makePath(from, to)}
              stroke={type === "stream" ? "#78350f" : "#0f172a"}
              strokeWidth={type === "stream" ? 4 : 2}
              fill="none"
            />
          ))}

          {/* Visible strokes */}
          {EDGES.map(({ from, to, type }) => {
            const d = makePath(from, to);
            const isStream = type === "stream";
            return (
              <path
                key={`ln-${from}-${to}`}
                d={d}
                stroke={isStream ? "#eab308" : "#334155"}
                strokeWidth={isStream ? 2.5 : 1.5}
                strokeOpacity={isStream ? 0.75 : 1}
                strokeDasharray={isStream ? undefined : "6 5"}
                fill="none"
                markerEnd="url(#arr)"
                filter={isStream ? "url(#glow-ws)" : undefined}
              />
            );
          })}

          {/* Animated particles */}
          {EDGES.map(({ from, to, type, delay }) => {
            const d = makePath(from, to);
            const srcColor = NODES.find(n => n.id === from)!.color;
            if (type === "batch")  return <BatchParticle  key={`p-${from}-${to}`} path={d} color={srcColor} delay={delay ?? 0} />;
            if (type === "stream") return <StreamParticles key={`s-${from}-${to}`} path={d} />;
            return null;
          })}
        </svg>

        {/* ── HTML layer: node boxes ── */}
        <div className="absolute inset-0 pointer-events-none">
          {NODES.map(node => {
            const { x, y } = nodeCenter(node);
            const left = x - COL_W / 2;
            const top  = y - NODE_H / 2;

            const box = (
              <div
                className="absolute flex flex-col justify-center px-3 py-2 rounded-xl border select-none pointer-events-auto transition-shadow duration-200 hover:brightness-110"
                style={{
                  left, top,
                  width: COL_W, height: NODE_H,
                  borderColor: node.color + "55",
                  background:  node.bg,
                  boxShadow:   `0 0 12px ${node.color}22`,
                  cursor:      node.href ? "pointer" : "default",
                }}
              >
                {/* Left status dot */}
                <span
                  className={`absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full ${node.live ? "" : "animate-pulse"}`}
                  style={{
                    background:  node.color,
                    boxShadow:   node.live ? `0 0 6px ${node.color}` : undefined,
                  }}
                />

                {/* LIVE badge — Binance WS only */}
                {node.live && (
                  <span
                    className="absolute right-6 top-1.5 animate-pulse rounded px-1 py-px text-[8px] font-bold tracking-wider"
                    style={{
                      background:  node.color + "20",
                      color:       node.color,
                      border:      `1px solid ${node.color}50`,
                    }}
                  >
                    LIVE
                  </span>
                )}

                <p className="text-xs font-bold text-white truncate pr-1">{node.label}</p>
                {node.sublabel && (
                  <p className="text-[10px] truncate" style={{ color: node.color + "cc" }}>
                    {node.sublabel}
                  </p>
                )}
                {node.href && (
                  <ExternalLink
                    className="absolute right-2 top-2 h-3 w-3 opacity-40"
                    style={{ color: node.color }}
                  />
                )}
              </div>
            );

            return node.href ? (
              <a key={node.id} href={node.href} target="_blank" rel="noopener noreferrer">
                {box}
              </a>
            ) : (
              <div key={node.id}>{box}</div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

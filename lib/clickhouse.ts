/**
 * ClickHouse HTTP API client
 * Auth: ClickHouse password only (no Cloudflare Zero Trust)
 * Endpoint: https://clickhouse.gabyer.dev (port 8123 proxied via Cloudflare Tunnel)
 */

const CH_URL      = "https://clickhouse.gabyer.dev";
const CH_USER     = "default";
const CH_DATABASE = "trading";

/** Symbols allowed in queries — whitelist prevents SQL injection */
export const CH_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "ADAUSDT"] as const;
export type ChSymbol = (typeof CH_SYMBOLS)[number];

export const SYMBOL_LABELS: Record<ChSymbol, string> = {
  BTCUSDT: "BTC",
  ETHUSDT: "ETH",
  SOLUSDT: "SOL",
  BNBUSDT: "BNB",
  ADAUSDT: "ADA",
};

interface CHResponse<T> {
  data: T[];
  rows: number;
  statistics: { elapsed: number; rows_read: number; bytes_read: number };
}

/**
 * Execute a raw SQL query against ClickHouse.
 * FORMAT JSON is appended automatically — do NOT include it in the query.
 */
export async function chQuery<T = Record<string, unknown>>(
  query: string
): Promise<T[]> {
  const password = process.env.CLICKHOUSE_PASSWORD;
  if (!password) throw new Error("Missing env var: CLICKHOUSE_PASSWORD");

  // Use GET + ?query= param (POST may be blocked by Cloudflare tunnel)
  const url = new URL(CH_URL);
  url.searchParams.set("query", query.trim() + " FORMAT JSON");
  url.searchParams.set("database", CH_DATABASE);
  url.searchParams.set("user", CH_USER);
  url.searchParams.set("password", password);

  const res = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ClickHouse ${res.status}: ${text.slice(0, 400)}`);
  }

  const json = (await res.json()) as CHResponse<T>;
  return json.data ?? [];
}

/** Helper: parse any value to float safely */
export function n(v: unknown): number {
  const f = parseFloat(String(v));
  return isNaN(f) ? 0 : f;
}

/** Helper: format datetime string to Almaty locale */
export function fmtTime(v: unknown): string {
  try {
    return new Date(String(v)).toLocaleString("ru-KZ", {
      timeZone: "Asia/Almaty",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch {
    return String(v);
  }
}

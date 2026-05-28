import { NextResponse } from "next/server";
import { chQuery, CH_SYMBOLS, n } from "@/lib/clickhouse";

export const dynamic = "force-dynamic";

export interface VwapRow {
  minute: string;
  vwap: number;
  total_volume: number;
  trade_count: number;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawSymbol = (searchParams.get("symbol") ?? "BTCUSDT").toUpperCase();
  const hours     = Math.min(parseInt(searchParams.get("hours") ?? "2"), 24);

  if (!(CH_SYMBOLS as readonly string[]).includes(rawSymbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  try {
    const rows = await chQuery<Record<string, unknown>>(`
      SELECT
        minute,
        vwap,
        total_volume,
        trade_count
      FROM trading.mv_vwap_1min
      WHERE symbol = '${rawSymbol}'
        AND minute >= now() - INTERVAL ${hours} HOUR
      ORDER BY minute ASC
    `);

    const data: VwapRow[] = rows.map((r) => ({
      minute:       String(r.minute),
      vwap:         n(r.vwap),
      total_volume: n(r.total_volume),
      trade_count:  n(r.trade_count),
    }));

    return NextResponse.json({ data, symbol: rawSymbol });
  } catch (err) {
    console.error("ch-vwap error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "ClickHouse query failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { chQuery, CH_SYMBOLS, n } from "@/lib/clickhouse";
import type { VwapRow } from "@/types/trading";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = (searchParams.get("symbol") ?? "BTCUSDT").toUpperCase();
    const hours     = Math.min(parseInt(searchParams.get("hours") ?? "2"), 24);

    if (!(CH_SYMBOLS as readonly string[]).includes(rawSymbol)) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }

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
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ch-vwap]", msg);
    return NextResponse.json({ error: msg, data: [] }, { status: 500 });
  }
}

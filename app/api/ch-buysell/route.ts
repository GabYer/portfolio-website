import { NextResponse } from "next/server";
import { chQuery, CH_SYMBOLS, n } from "@/lib/clickhouse";
import type { BuySellRow } from "@/types/trading";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = (searchParams.get("symbol") ?? "BTCUSDT").toUpperCase();
    const minutes   = Math.min(parseInt(searchParams.get("minutes") ?? "30"), 120);

    if (!(CH_SYMBOLS as readonly string[]).includes(rawSymbol)) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }

    const rows = await chQuery<Record<string, unknown>>(`
      SELECT
        minute,
        buy_volume,
        sell_volume,
        buy_count,
        sell_count
      FROM trading.mv_buysell_1min
      WHERE symbol = '${rawSymbol}'
        AND minute >= now() - INTERVAL ${minutes} MINUTE
      ORDER BY minute ASC
    `);

    const data: BuySellRow[] = rows.map((r) => ({
      minute:      String(r.minute),
      buy_volume:  n(r.buy_volume),
      sell_volume: n(r.sell_volume),
      buy_count:   n(r.buy_count),
      sell_count:  n(r.sell_count),
    }));

    return NextResponse.json({ data, symbol: rawSymbol });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ch-buysell]", msg);
    return NextResponse.json({ error: msg, data: [] }, { status: 500 });
  }
}

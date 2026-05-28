import { NextResponse } from "next/server";
import { chQuery, CH_SYMBOLS, n } from "@/lib/clickhouse";

export const dynamic = "force-dynamic";

export interface BuySellRow {
  minute: string;
  buy_volume: number;
  sell_volume: number;
  buy_count: number;
  sell_count: number;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawSymbol = (searchParams.get("symbol") ?? "BTCUSDT").toUpperCase();
  const minutes   = Math.min(parseInt(searchParams.get("minutes") ?? "30"), 120);

  if (!(CH_SYMBOLS as readonly string[]).includes(rawSymbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  try {
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
    console.error("ch-buysell error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "ClickHouse query failed" },
      { status: 500 }
    );
  }
}

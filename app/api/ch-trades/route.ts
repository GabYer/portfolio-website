import { NextResponse } from "next/server";
import { chQuery, CH_SYMBOLS, n } from "@/lib/clickhouse";
import type { OhlcvRow } from "@/types/trading";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = (searchParams.get("symbol") ?? "BTCUSDT").toUpperCase();

    if (!(CH_SYMBOLS as readonly string[]).includes(rawSymbol)) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }

    const rows = await chQuery<Record<string, unknown>>(`
      SELECT
        toStartOfMinute(trade_time)    AS minute,
        argMin(price, trade_time)      AS open,
        max(price)                     AS high,
        min(price)                     AS low,
        argMax(price, trade_time)      AS close,
        sum(quantity)                  AS volume,
        count()                        AS trade_count
      FROM trading.binance_trades
      WHERE symbol     = '${rawSymbol}'
        AND trade_time >= now() - INTERVAL 1 HOUR
      GROUP BY minute
      ORDER BY minute DESC
      LIMIT 60
    `);

    const data: OhlcvRow[] = rows.map((r) => ({
      minute:      String(r.minute),
      open:        n(r.open),
      high:        n(r.high),
      low:         n(r.low),
      close:       n(r.close),
      volume:      n(r.volume),
      trade_count: n(r.trade_count),
    }));

    return NextResponse.json({ data, symbol: rawSymbol });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ch-trades]", msg);
    return NextResponse.json({ error: msg, data: [] }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { chQuery, CH_SYMBOLS, n } from "@/lib/clickhouse";

export const dynamic = "force-dynamic";

export interface OhlcvRow {
  minute: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trade_count: number;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawSymbol = (searchParams.get("symbol") ?? "BTCUSDT").toUpperCase();

  if (!(CH_SYMBOLS as readonly string[]).includes(rawSymbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  try {
    const rows = await chQuery<Record<string, unknown>>(`
      SELECT
        toStartOfMinute(timestamp)     AS minute,
        argMin(price, timestamp)       AS open,
        max(price)                     AS high,
        min(price)                     AS low,
        argMax(price, timestamp)       AS close,
        sum(quantity)                  AS volume,
        count()                        AS trade_count
      FROM trading.binance_trades
      WHERE symbol   = '${rawSymbol}'
        AND timestamp >= now() - INTERVAL 1 HOUR
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
    console.error("ch-trades error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "ClickHouse query failed" },
      { status: 500 }
    );
  }
}

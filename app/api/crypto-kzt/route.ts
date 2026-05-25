import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const sql = getDb();
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "BTC";

  try {
    const rows = await sql`
      SELECT
        trade_date,
        symbol,
        avg_price_usd,
        avg_price_kzt
      FROM mart.mart_daily_crypto_kzt
      WHERE symbol = ${symbol.toUpperCase()}
      ORDER BY trade_date DESC
      LIMIT 30
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("crypto-kzt API error:", err);
    return NextResponse.json({ error: "Failed to fetch crypto KZT data" }, { status: 500 });
  }
}

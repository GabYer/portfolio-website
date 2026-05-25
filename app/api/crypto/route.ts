import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT
        coin_id,
        symbol,
        current_price_usd,
        price_change_pct_24h,
        market_cap_usd
      FROM staging.stg_crypto_prices
      ORDER BY market_cap_usd DESC NULLS LAST
      LIMIT 20
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("crypto API error:", err);
    return NextResponse.json({ error: "Failed to fetch crypto data" }, { status: 500 });
  }
}

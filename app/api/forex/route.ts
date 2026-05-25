import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT
        currency_code,
        rate_kzt,
        units,
        rate_date
      FROM staging.stg_forex_rates
      ORDER BY rate_date DESC
      LIMIT 30
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("forex API error:", err);
    return NextResponse.json({ error: "Failed to fetch forex data" }, { status: 500 });
  }
}

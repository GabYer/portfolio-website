import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT
        rate_date,
        currency_code,
        rate_per_unit,
        day_change
      FROM mart.mart_forex_trend
      ORDER BY rate_date DESC
      LIMIT 60
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("forex-trend API error:", err);
    return NextResponse.json({ error: "Failed to fetch forex trend" }, { status: 500 });
  }
}

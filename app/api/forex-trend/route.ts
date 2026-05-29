import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const sql = getDb();
  try {
    const { searchParams } = new URL(req.url);
    const days = Math.min(Math.max(parseInt(searchParams.get("days") ?? "30"), 1), 1095);

    const rows = await sql`
      SELECT
        rate_date,
        currency_code,
        rate_per_unit,
        day_change
      FROM mart.mart_forex_trend
      WHERE rate_date >= CURRENT_DATE - (${days} || ' days')::interval
      ORDER BY rate_date ASC
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("forex-trend API error:", err);
    return NextResponse.json({ error: "Failed to fetch forex trend" }, { status: 500 });
  }
}

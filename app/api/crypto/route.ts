import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT *
      FROM staging.stg_crypto_prices
      ORDER BY loaded_at DESC NULLS LAST
      LIMIT 20
    `;

    const fetched_at = new Date().toLocaleString("ru-KZ", {
      timeZone: "Asia/Almaty",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

    return NextResponse.json({ data: rows, fetched_at });
  } catch (err) {
    console.error("crypto API error:", err);
    return NextResponse.json({ error: "Failed to fetch crypto data" }, { status: 500 });
  }
}

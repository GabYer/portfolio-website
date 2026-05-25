import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT
        title,
        category,
        published_at,
        url
      FROM staging.stg_news
      ORDER BY published_at DESC
      LIMIT 20
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("news API error:", err);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

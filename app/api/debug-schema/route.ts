import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();
  const rows = await sql`
    SELECT table_schema, table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema IN ('staging', 'mart')
    ORDER BY table_schema, table_name, ordinal_position
  `;
  return NextResponse.json({ data: rows });
}

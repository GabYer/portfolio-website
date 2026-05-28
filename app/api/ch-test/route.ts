import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // 1. Check env vars
  const envCheck = {
    CF_CLIENT_ID:     !!process.env.CF_CLIENT_ID,
    CF_CLIENT_SECRET: !!process.env.CF_CLIENT_SECRET,
    CLICKHOUSE_PASSWORD: !!process.env.CLICKHOUSE_PASSWORD,
    CF_CLIENT_ID_value:  process.env.CF_CLIENT_ID?.slice(0, 8) + "...",
  };

  if (!process.env.CF_CLIENT_ID || !process.env.CF_CLIENT_SECRET || !process.env.CLICKHOUSE_PASSWORD) {
    return NextResponse.json({ ok: false, stage: "env", envCheck });
  }

  // 2. Try raw fetch to ClickHouse
  let rawStatus = 0;
  let rawBody   = "";
  try {
    const res = await fetch("https://clickhouse.gabyer.dev/", {
      method: "POST",
      cache:  "no-store",
      headers: {
        "CF-Access-Client-Id":     process.env.CF_CLIENT_ID,
        "CF-Access-Client-Secret": process.env.CF_CLIENT_SECRET,
        "X-ClickHouse-User":       "default",
        "X-ClickHouse-Key":        process.env.CLICKHOUSE_PASSWORD,
        "X-ClickHouse-Database":   "trading",
        "Content-Type":            "text/plain",
      },
      body: "SELECT 1 FORMAT JSON",
    });
    rawStatus = res.status;
    rawBody   = (await res.text()).slice(0, 500);
  } catch (e) {
    return NextResponse.json({
      ok: false, stage: "fetch",
      error: e instanceof Error ? e.message : String(e),
      envCheck,
    });
  }

  return NextResponse.json({
    ok: rawStatus === 200,
    stage:     "clickhouse",
    httpStatus: rawStatus,
    body:       rawBody,
    envCheck,
  });
}

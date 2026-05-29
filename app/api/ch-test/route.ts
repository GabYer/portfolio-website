import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // 1. Check env var
  const password = process.env.CLICKHOUSE_PASSWORD;
  if (!password) {
    return NextResponse.json({
      ok: false,
      stage: "env",
      error: "CLICKHOUSE_PASSWORD is not set",
    });
  }

  // 2. Try raw fetch to ClickHouse
  let rawStatus = 0;
  let rawBody   = "";
  try {
    const res = await fetch("https://clickhouse.gabyer.dev", {
      method: "POST",
      cache:  "no-store",
      headers: {
        "X-ClickHouse-User":     "default",
        "X-ClickHouse-Key":      password,
        "X-ClickHouse-Database": "trading",
        "Content-Type":          "text/plain",
      },
      body: "SELECT 1 FORMAT JSON",
    });
    rawStatus = res.status;
    rawBody   = (await res.text()).slice(0, 500);
  } catch (e) {
    return NextResponse.json({
      ok:    false,
      stage: "fetch",
      error: e instanceof Error ? e.message : String(e),
    });
  }

  // Detect CF Access HTML login page (returns 200 but with HTML)
  const isHtml = rawBody.trimStart().startsWith("<");

  return NextResponse.json({
    ok:         rawStatus === 200 && !isHtml,
    stage:      "clickhouse",
    httpStatus: rawStatus,
    isHtml,
    body:       rawBody,
  });
}

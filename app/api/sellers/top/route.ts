import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const basis = searchParams.get("basis") ?? "REVENUE";
  const period = searchParams.get("period") ?? "LAST_30_DAYS";
  const limit = searchParams.get("limit") ?? "10";

  const url = `${BASE_URL}/api/v1/sellers/top?basis=${basis}&period=${period}&limit=${limit}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("Error fetching top sellers:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to fetch top sellers" },
      { status: 502 }
    );
  }
}

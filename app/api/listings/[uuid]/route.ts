import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/listings/${uuid}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error(`Error fetching listing ${uuid}:`, err);
    return NextResponse.json(
      { message: err?.message || "Failed to fetch listing" },
      { status: 502 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "Seller ID required" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const pageNumber = searchParams.get("pageNumber") ?? "0";
  const pageSize = searchParams.get("pageSize") ?? "50";

  // Try both seller listings endpoint and listing query by sellerId
  const url1 = `${BASE_URL}/api/v1/sellers/${encodeURIComponent(id)}/listings?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  const url2 = `${BASE_URL}/api/v1/listings?sellerId=${encodeURIComponent(id)}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

  try {
    let res = await fetch(url1, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      res = await fetch(url2, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error(`Error fetching listings for seller ${id}:`, err);
    return NextResponse.json(
      { message: err?.message || "Failed to fetch seller listings" },
      { status: 502 }
    );
  }
}

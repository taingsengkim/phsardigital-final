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

  const url = `${BASE_URL}/api/v1/sellers/${encodeURIComponent(id)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      return NextResponse.json(
        data || { message: "Seller not found" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error(`Error fetching seller ${id}:`, err);
    return NextResponse.json(
      { message: err?.message || "Failed to fetch seller" },
      { status: 502 }
    );
  }
}

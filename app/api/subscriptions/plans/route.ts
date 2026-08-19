import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com";

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/subscriptions/plans`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { message: `Failed to fetch plans: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching subscription plans:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to fetch subscription plans" },
      { status: 502 }
    );
  }
}

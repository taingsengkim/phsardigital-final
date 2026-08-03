import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://phsardigital.quizzy.it.com";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const upstreamRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await upstreamRes.text();
    let data: unknown = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!upstreamRes.ok) {
      const message =
        typeof data === "string"
          ? data
          : (data as { message?: string; error?: string; detail?: string } | null)?.message ||
            (data as { message?: string; error?: string; detail?: string } | null)?.error ||
            (data as { message?: string; error?: string; detail?: string } | null)?.detail ||
            `Registration failed (${upstreamRes.status})`;

      return NextResponse.json({ message }, { status: upstreamRes.status });
    }

    return NextResponse.json(data ?? { success: true }, { status: upstreamRes.status });
  } catch {
    return NextResponse.json(
      { message: "Registration service is unavailable right now. Please try again later." },
      { status: 502 },
    );
  }
}

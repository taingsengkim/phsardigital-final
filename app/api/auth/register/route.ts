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
      if (data && typeof data === "object") {
        return NextResponse.json(data, { status: upstreamRes.status });
      }

      const message =
        typeof data === "string"
          ? data
          : `Registration failed (${upstreamRes.status})`;

      return NextResponse.json({ message }, { status: upstreamRes.status });
    }

    return NextResponse.json(data ?? { success: true }, { status: upstreamRes.status });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      {
        message:
          err?.message ||
          "Registration service is unavailable right now. Please try again later.",
      },
      { status: 502 },
    );
  }
}

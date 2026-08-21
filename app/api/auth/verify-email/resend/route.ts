import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com";

/** Re-send the verification email for an address that has registered. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${BASE_URL}/api/v1/auth/verify-email/resend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    // 202 Accepted carries no body — give the client something to unwrap.
    return NextResponse.json(data ?? { accepted: res.ok }, { status: res.status });
  } catch (err: unknown) {
    console.error("Resend verification error:", err);
    return NextResponse.json(
      {
        message:
          err instanceof Error
            ? err.message
            : "Could not resend the verification email right now.",
      },
      { status: 502 }
    );
  }
}

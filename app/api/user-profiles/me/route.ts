import { NextRequest, NextResponse } from "next/server";
import { auth as getNextAuthSession } from "@/lib/auth";

const BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com";

async function getAuthHeader(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader) return authHeader;

  // Use NextAuth to get the session and the accessToken
  const session = await getNextAuthSession();
  
  // @ts-ignore
  const token = session?.accessToken;

  if (token) {
    return `Bearer ${token}`;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const auth = await getAuthHeader(request);
  
  if (!auth) {
     return NextResponse.json({ message: "Unauthorized - No auth header found" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BASE_URL}/api/v1/user-profiles/me`, {
      headers: {
        Authorization: auth,
        Accept: "application/json",
      },
      cache: "no-store",
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

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("Profile fetch error:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to fetch profile" },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthHeader(request);

  if (!auth) {
     return NextResponse.json({ message: "Unauthorized - No auth header found" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const res = await fetch(`${BASE_URL}/api/v1/user-profiles/me`, {
      method: "PATCH",
      headers: {
        Authorization: auth,
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

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to update profile" },
      { status: 502 },
    );
  }
}

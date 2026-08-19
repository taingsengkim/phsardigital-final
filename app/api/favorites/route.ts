import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com";

async function getAuthHeader(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader) return authHeader;

  try {
    const account = await auth.api.getAccessToken({
      headers: request.headers,
      body: { providerId: "keycloak" },
    });
    const token = account?.accessToken;
    if (token) return `Bearer ${token}`;
  } catch (err) {
    console.error("Failed to acquire access token for favorites:", err);
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = await getAuthHeader(request);

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = `${BASE_URL}/api/v1/favorites${searchParams ? `?${searchParams}` : ""}`;

    const res = await fetch(targetUrl, {
      headers,
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!res.ok) {
      console.warn(`Backend GET /api/v1/favorites responded with status ${res.status}`);
      return NextResponse.json(
        data || { message: "Failed to fetch favorites" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status || 200 });
  } catch (err: any) {
    console.error("Error in /api/favorites GET route handler proxy:", err);
    return NextResponse.json(
      { message: err?.message || "Internal server error" },
      { status: 502 }
    );
  }
}

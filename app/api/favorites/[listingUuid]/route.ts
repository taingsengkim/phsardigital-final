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
    console.error("Failed to acquire access token for favorite toggle:", err);
  }

  return null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listingUuid: string }> }
) {
  try {
    const { listingUuid } = await params;
    if (!listingUuid) {
      return NextResponse.json(
        { message: "Listing UUID is required" },
        { status: 400 }
      );
    }

    const authHeader = await getAuthHeader(request);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const targetUrl = `${BASE_URL}/api/v1/favorites/${listingUuid}`;

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
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
      console.warn(`Backend POST /api/v1/favorites/${listingUuid} responded with status ${res.status}`);
      return NextResponse.json(
        data || { message: "Failed to add favorite" },
        { status: res.status }
      );
    }

    return NextResponse.json(data || { success: true }, { status: res.status || 200 });
  } catch (err: any) {
    console.error("Error in /api/favorites/[listingUuid] POST route handler proxy:", err);
    return NextResponse.json(
      { message: err?.message || "Internal server error" },
      { status: 502 }
    );
  }
}

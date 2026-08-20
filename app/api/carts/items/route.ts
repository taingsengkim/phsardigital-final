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
    console.error("Failed to acquire access token for cart:", err);
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingUuid, quantity = 1 } = body ?? {};

    if (!listingUuid) {
      return NextResponse.json(
        { message: "listingUuid is required" },
        { status: 400 }
      );
    }

    const authHeader = await getAuthHeader(request);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const targetUrl = `${BASE_URL}/api/v1/carts/items`;

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        listingUuid,
        quantity: Number(quantity) || 1,
      }),
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        // If Tomcat returns HTML error page, extract meaningful text or return clean error object
        data = {
          message: text.includes("<title>")
            ? "Bad Request - Please check item availability or authentication"
            : text,
        };
      }
    }

    if (!res.ok) {
      console.warn(`Backend POST /api/v1/carts/items responded with status ${res.status}`);
      return NextResponse.json(
        data || { message: "Failed to add item to cart" },
        { status: res.status }
      );
    }

    return NextResponse.json(data ?? { success: true, listingUuid, quantity }, {
      status: res.status || 200,
    });
  } catch (err: any) {
    console.error("Error in /api/carts/items route handler proxy:", err);
    return NextResponse.json(
      { message: err?.message || "Internal server error" },
      { status: 502 }
    );
  }
}

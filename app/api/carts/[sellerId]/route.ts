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
    console.error("Failed to acquire access token for seller cart operation:", err);
  }

  return null;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await params;

    if (!sellerId) {
      return NextResponse.json(
        { message: "sellerId is required" },
        { status: 400 }
      );
    }

    const authHeader = await getAuthHeader(request);
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const targetUrl = `${BASE_URL}/api/v1/carts/${sellerId}`;

    const res = await fetch(targetUrl, {
      method: "DELETE",
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
      console.warn(`Backend DELETE /api/v1/carts/${sellerId} responded with status ${res.status}`);
      return NextResponse.json(
        data || { message: "Failed to delete seller cart" },
        { status: res.status }
      );
    }

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(data ?? { success: true, sellerId }, {
      status: res.status && res.status !== 204 ? res.status : 200,
    });
  } catch (err: any) {
    console.error("Error in /api/carts/[sellerId] DELETE route handler proxy:", err);
    return NextResponse.json(
      { message: err?.message || "Internal server error" },
      { status: 502 }
    );
  }
}

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
    console.error("Failed to acquire access token:", err);
  }

  return null;
}

export async function GET(request: NextRequest) {
  const authHeader = await getAuthHeader(request);

  if (!authHeader) {
    return NextResponse.json(
      { message: "Unauthorized - Please sign in" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${BASE_URL}/api/v1/sellers/me`, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (res.status === 404) {
      return NextResponse.json(null, { status: 200 });
    }

    const text = await res.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("Error fetching seller profile me:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to fetch seller profile" },
      { status: 502 }
    );
  }
}

/** Update the signed-in seller's own shop profile. */
export async function PATCH(request: NextRequest) {
  const authHeader = await getAuthHeader(request);

  if (!authHeader) {
    return NextResponse.json(
      { message: "Unauthorized - Please sign in" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const res = await fetch(`${BASE_URL}/api/v1/sellers/me`, {
      method: "PATCH",
      headers: {
        Authorization: authHeader,
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
  } catch (err: unknown) {
    console.error("Error updating seller profile:", err);
    return NextResponse.json(
      {
        message:
          err instanceof Error ? err.message : "Failed to update seller profile",
      },
      { status: 502 }
    );
  }
}

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

/** Filter parameters GET /api/v1/listings honours, forwarded when present. */
const FORWARDED_PARAMS = [
  "status",
  "categoryUuid",
  "categorySlug",
  "sellerId",
  "search",
  "minPrice",
  "maxPrice",
  "sort",
] as const;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const upstream = new URLSearchParams({
    pageNumber: searchParams.get("pageNumber") ?? "0",
    pageSize: searchParams.get("pageSize") ?? "20",
  });

  for (const key of FORWARDED_PARAMS) {
    const value = searchParams.get(key);
    if (value) upstream.set(key, value);
  }

  const url = `${BASE_URL}/api/v1/listings?${upstream.toString()}`;

  try {
    const authHeader = await getAuthHeader(request);
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const res = await fetch(url, {
      headers,
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("Error fetching listings:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to fetch listings" },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authHeader = await getAuthHeader(request);

  if (!authHeader) {
    return NextResponse.json(
      { message: "Unauthorized - Please sign in to create a product" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const res = await fetch(`${BASE_URL}/api/v1/listings`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      return NextResponse.json(
        data || { message: "Failed to create product listing" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("Error creating listing:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to create listing" },
      { status: 502 }
    );
  }
}

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

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const pageNumber = searchParams.get("pageNumber") ?? "0";
  const pageSize = searchParams.get("pageSize") ?? "20";

  let url = `${BASE_URL}/api/v1/listings/me?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (status) url += `&status=${status}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      cache: "no-store",
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

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("Error fetching my seller listings:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to fetch seller listings" },
      { status: 502 }
    );
  }
}

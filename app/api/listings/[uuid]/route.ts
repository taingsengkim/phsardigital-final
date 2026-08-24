import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com";

async function getAuthHeader(request: NextRequest) {
  const existing = request.headers.get("authorization");
  if (existing) return existing;
  try {
    const account = await auth.api.getAccessToken({ headers: request.headers, body: { providerId: "keycloak" } });
    return account?.accessToken ? `Bearer ${account.accessToken}` : null;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/listings/${uuid}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error(`Error fetching listing ${uuid}:`, err);
    return NextResponse.json(
      { message: err?.message || "Failed to fetch listing" },
      { status: 502 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const authorization = await getAuthHeader(request);
  if (!authorization) return NextResponse.json({ message: "Unauthorized - Please sign in" }, { status: 401 });
  const { uuid } = await params;
  const body = await request.text();
  try {
    const res = await fetch(`${BASE_URL}/api/v1/listings/${encodeURIComponent(uuid)}/status`, {
      method: "PATCH",
      headers: { Authorization: authorization, Accept: "application/json", "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    const text = await res.text();
    let data: unknown = null;
    if (text) { try { data = JSON.parse(text); } catch { data = { message: text }; } }
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to update listing status" }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const authorization = await getAuthHeader(request);
  if (!authorization) return NextResponse.json({ message: "Unauthorized - Please sign in" }, { status: 401 });
  const { uuid } = await params;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/listings/${encodeURIComponent(uuid)}`, {
      method: "DELETE",
      headers: { Authorization: authorization, Accept: "application/json" },
      cache: "no-store",
    });
    const text = await res.text();
    if (!text) return new NextResponse(null, { status: res.status });
    try {
      return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
      return NextResponse.json({ message: text }, { status: res.status });
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to delete listing" }, { status: 502 });
  }
}

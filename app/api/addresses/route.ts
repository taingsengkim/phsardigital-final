import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  errorMessage,
  getAuthHeader,
  readBody,
} from "@/lib/server-auth";

/** A Response body can only be read once, so build a fresh one per call. */
const unauthorized = () =>
  NextResponse.json({ message: "Unauthorized - Please sign in" }, { status: 401 });

/** List the signed-in user's delivery addresses. */
export async function GET(request: NextRequest) {
  const authHeader = await getAuthHeader(request);
  if (!authHeader) return unauthorized();

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/addresses`, {
      headers: { Authorization: authHeader, Accept: "application/json" },
      cache: "no-store",
    });
    return NextResponse.json(await readBody(res), { status: res.status });
  } catch (err: unknown) {
    console.error("Error fetching addresses:", err);
    return NextResponse.json(
      { message: errorMessage(err, "Failed to fetch addresses") },
      { status: 502 }
    );
  }
}

/** Create a new delivery address. */
export async function POST(request: NextRequest) {
  const authHeader = await getAuthHeader(request);
  if (!authHeader) return unauthorized();

  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE_URL}/api/v1/addresses`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    return NextResponse.json(await readBody(res), { status: res.status });
  } catch (err: unknown) {
    console.error("Error creating address:", err);
    return NextResponse.json(
      { message: errorMessage(err, "Failed to create address") },
      { status: 502 }
    );
  }
}

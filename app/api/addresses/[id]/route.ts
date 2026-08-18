import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  errorMessage,
  getAuthHeader,
  readBody,
} from "@/lib/server-auth";

type Context = { params: Promise<{ id: string }> };

/** A Response body can only be read once, so build a fresh one per call. */
const unauthorized = () =>
  NextResponse.json({ message: "Unauthorized - Please sign in" }, { status: 401 });

/** Update one delivery address. */
export async function PATCH(request: NextRequest, { params }: Context) {
  const authHeader = await getAuthHeader(request);
  if (!authHeader) return unauthorized();

  const { id } = await params;

  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    return NextResponse.json(await readBody(res), { status: res.status });
  } catch (err: unknown) {
    console.error(`Error updating address ${id}:`, err);
    return NextResponse.json(
      { message: errorMessage(err, "Failed to update address") },
      { status: 502 }
    );
  }
}

/** Delete one delivery address. */
export async function DELETE(request: NextRequest, { params }: Context) {
  const authHeader = await getAuthHeader(request);
  if (!authHeader) return unauthorized();

  const { id } = await params;

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader, Accept: "application/json" },
    });
    return NextResponse.json(await readBody(res), { status: res.status });
  } catch (err: unknown) {
    console.error(`Error deleting address ${id}:`, err);
    return NextResponse.json(
      { message: errorMessage(err, "Failed to delete address") },
      { status: 502 }
    );
  }
}

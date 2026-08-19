import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  errorMessage,
  getAuthHeader,
  readBody,
} from "@/lib/server-auth";

type Context = { params: Promise<{ id: string }> };

/** Promote one address to be the default delivery address. */
export async function PATCH(request: NextRequest, { params }: Context) {
  const authHeader = await getAuthHeader(request);
  if (!authHeader) {
    return NextResponse.json(
      { message: "Unauthorized - Please sign in" },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${id}/default`, {
      method: "PATCH",
      headers: { Authorization: authHeader, Accept: "application/json" },
    });
    return NextResponse.json(await readBody(res), { status: res.status });
  } catch (err: unknown) {
    console.error(`Error setting default address ${id}:`, err);
    return NextResponse.json(
      { message: errorMessage(err, "Failed to set default address") },
      { status: 502 }
    );
  }
}

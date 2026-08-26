import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Batch file upload — POST /api/v1/files/upload-multiple, field name "files".
 *
 * This cannot go through `proxyAuthenticated`: that helper reads the body as
 * text and forces `Content-Type: application/json`, which would destroy a
 * multipart boundary. The FormData is streamed through untouched instead, and
 * fetch sets the boundary itself.
 */
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

export async function POST(request: NextRequest) {
  const authHeader = await getAuthHeader(request);

  if (!authHeader) {
    return NextResponse.json(
      { message: "Unauthorized - Please sign in" },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const res = await fetch(`${BASE_URL}/api/v1/files/upload-multiple`, {
      method: "POST",
      headers: { Authorization: authHeader },
      body: formData,
    });

    const text = await res.text();
    if (!text) return new NextResponse(null, { status: res.status });
    try {
      return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
      return NextResponse.json({ message: text }, { status: res.status });
    }
  } catch (err) {
    return NextResponse.json(
      {
        message:
          err instanceof Error ? err.message : "Failed to upload the files",
      },
      { status: 502 },
    );
  }
}

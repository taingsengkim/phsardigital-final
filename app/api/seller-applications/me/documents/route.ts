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

export async function POST(request: NextRequest) {
  const authHeader = await getAuthHeader(request);

  if (!authHeader) {
    return NextResponse.json(
      { message: "Unauthorized - Please sign in" },
      { status: 401 }
    );
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    let response: Response;

    if (contentType.includes("application/json")) {
      const bodyJson = await request.json();
      response = await fetch(
        `${BASE_URL}/api/v1/seller-applications/me/documents`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(bodyJson),
        }
      );
    } else {
      const formData = await request.formData();
      response = await fetch(
        `${BASE_URL}/api/v1/seller-applications/me/documents`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
          },
          body: formData,
        }
      );
    }

    const text = await response.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error("Error attaching seller document:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to attach document" },
      { status: 502 }
    );
  }
}

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
    const formData = await request.formData();
    const res = await fetch(`${BASE_URL}/api/v1/files/upload`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
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
      const cleanMessage =
        data?.message ||
        (res.status === 415
          ? "Unsupported file format. Please upload JPG, PNG, WebP, or GIF."
          : "Failed to upload file.");
      return NextResponse.json({ message: cleanMessage }, { status: res.status });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("Error uploading file to generic endpoint:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to upload file" },
      { status: 502 }
    );
  }
}

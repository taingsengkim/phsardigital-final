import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com";

async function getAuthHeader(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader) return authHeader;

  const account = await auth.api.getAccessToken({
    headers: request.headers,
    body: { providerId: "keycloak" },
  });
  const token = account?.accessToken;

  if (token) {
    return `Bearer ${token}`;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const auth = await getAuthHeader(request);

  if (!auth) {
    return NextResponse.json({ message: "Unauthorized - No auth header found" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const res = await fetch(`${BASE_URL}/api/v1/user-profiles/me/avatar`, {
      method: "POST",
      headers: {
        Authorization: auth,
        Accept: "application/json",
      },
      body: formData,
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
  } catch (err: any) {
    console.error("Avatar upload error:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to upload avatar" },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthHeader(request);

  if (!auth) {
    return NextResponse.json({ message: "Unauthorized - No auth header found" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BASE_URL}/api/v1/user-profiles/me/avatar`, {
      method: "DELETE",
      headers: {
        Authorization: auth,
        Accept: "application/json",
      },
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
  } catch (err: any) {
    console.error("Avatar delete error:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to delete avatar" },
      { status: 502 },
    );
  }
}

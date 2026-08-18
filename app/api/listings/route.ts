import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"

const BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com"

async function getAuthorization(request: NextRequest) {
  const authorization = request.headers.get("authorization")
  if (authorization) return authorization

  try {
    const account = await auth.api.getAccessToken({
      headers: request.headers,
      body: { providerId: "keycloak" },
    })
    return account?.accessToken ? `Bearer ${account.accessToken}` : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const authorization = await getAuthorization(request)
  if (!authorization) {
    return NextResponse.json({ message: "Unauthorized - Please sign in" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const response = await fetch(`${BASE_URL}/api/v1/listings`, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    const text = await response.text()
    let data: unknown = null
    if (text) {
      try { data = JSON.parse(text) } catch { data = { message: text } }
    }
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create listing" },
      { status: 502 },
    )
  }
}

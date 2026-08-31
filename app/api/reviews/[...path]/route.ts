import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com"

type Context = { params: Promise<{ path: string[] }> }

async function upstream(request: NextRequest, context: Context) {
  const { path } = await context.params
  return `/api/v1/reviews/${path.map(encodeURIComponent).join("/")}${new URL(request.url).search}`
}

export async function GET(request: NextRequest, context: Context) {
  const { path } = await context.params

  // Authenticated routes: /api/v1/reviews/me, /api/v1/reviews/sellers/me
  const isAuthRequired =
    path[0] === "me" ||
    (path[0] === "sellers" && path[1] === "me")

  if (isAuthRequired) {
    return proxyAuthenticated(request, await upstream(request, context))
  }

  // Public routes: /api/v1/reviews/listings/{uuid}, /api/v1/reviews/sellers/{id}, /summary, etc.
  let authorization = request.headers.get("authorization")
  if (!authorization) {
    try {
      const account = await auth.api.getAccessToken({
        headers: request.headers,
        body: { providerId: "keycloak" },
      })
      if (account?.accessToken) authorization = `Bearer ${account.accessToken}`
    } catch {
      authorization = null
    }
  }

  const upstreamPath = await upstream(request, context)
  try {
    const res = await fetch(`${API_BASE_URL}${upstreamPath}`, {
      headers: {
        Accept: "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    })
    const text = await res.text()
    if (!text) return new NextResponse(null, { status: res.status })
    try {
      return NextResponse.json(JSON.parse(text), { status: res.status })
    } catch {
      return NextResponse.json({ message: text }, { status: res.status })
    }
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Failed to fetch reviews" },
      { status: 502 },
    )
  }
}

export async function POST(request: NextRequest, context: Context) {
  return proxyAuthenticated(request, await upstream(request, context))
}

export async function PATCH(request: NextRequest, context: Context) {
  return proxyAuthenticated(request, await upstream(request, context))
}

export async function DELETE(request: NextRequest, context: Context) {
  return proxyAuthenticated(request, await upstream(request, context))
}

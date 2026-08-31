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

export async function GET(request: NextRequest) {
  const authorization = await getAuthorization(request)
  if (!authorization) {
    return NextResponse.json({ message: "Unauthorized - Please sign in" }, { status: 401 })
  }

  const resource = request.nextUrl.searchParams.get("resource")
  const pageNumber = request.nextUrl.searchParams.get("pageNumber") ?? "0"
  const rawPageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? "20")
  const clampedPageSize = isNaN(rawPageSize) || rawPageSize < 1 ? 20 : Math.min(rawPageSize, 100)
  const pageSize = String(clampedPageSize)
  const pagination = `pageNumber=${encodeURIComponent(pageNumber)}&pageSize=${encodeURIComponent(pageSize)}`
  const pageable = `page=${encodeURIComponent(pageNumber)}&size=${encodeURIComponent(pageSize)}`

  let upstreamPath: string
  switch (resource) {
    case "profile":
      upstreamPath = "/api/v1/sellers/me"
      break
    case "orders":
      upstreamPath = `/api/v1/purchases/seller/orders?${pagination}`
      break
    case "reviews":
      upstreamPath = `/api/v1/reviews/sellers/me?${pageable}`
      break
    case "conversations":
      upstreamPath = "/api/v1/conversations"
      break
    case "listings": {
      const sellerId = request.nextUrl.searchParams.get("sellerId")
      if (!sellerId) {
        return NextResponse.json({ message: "sellerId is required" }, { status: 400 })
      }
      upstreamPath = `/api/v1/sellers/${encodeURIComponent(sellerId)}/listings?${pageable}`
      break
    }
    default:
      return NextResponse.json({ message: "Unknown dashboard resource" }, { status: 400 })
  }

  try {
    const response = await fetch(`${BASE_URL}${upstreamPath}`, {
      headers: { Authorization: authorization, Accept: "application/json" },
      cache: "no-store",
    })
    const text = await response.text()
    let data: unknown = null
    if (text) {
      try { data = JSON.parse(text) } catch { data = { message: text } }
    }
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch dashboard data" },
      { status: 502 },
    )
  }
}

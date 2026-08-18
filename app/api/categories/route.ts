import { NextRequest, NextResponse } from "next/server"

const BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com"

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/categories`, {
      headers: request.headers.get("authorization")
        ? { Authorization: request.headers.get("authorization")! }
        : undefined,
      cache: "no-store",
    })
    const text = await response.text()
    const data = text ? JSON.parse(text) : null
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch categories" },
      { status: 502 },
    )
  }
}

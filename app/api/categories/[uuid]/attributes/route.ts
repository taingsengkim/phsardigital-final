import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://phsardigital.quizzy.it.com"

export async function GET(request: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const includeInherited = new URL(request.url).searchParams.get("includeInherited") ?? "true"
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/categories/${encodeURIComponent(uuid)}/attributes?includeInherited=${encodeURIComponent(includeInherited)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(15_000),
    })
    const text = await response.text()
    if (!text) return new NextResponse(null, { status: response.status })
    try { return NextResponse.json(JSON.parse(text), { status: response.status }) }
    catch { return NextResponse.json({ message: text }, { status: response.status }) }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to load category attributes" }, { status: 502 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://phsardigital.quizzy.it.com"

export async function proxyAuthenticated(request: NextRequest, upstreamPath: string, method = request.method) {
  let authorization = request.headers.get("authorization")
  if (!authorization) {
    try {
      const account = await auth.api.getAccessToken({ headers: request.headers, body: { providerId: "keycloak" } })
      if (account?.accessToken) authorization = `Bearer ${account.accessToken}`
    } catch {
      authorization = null
    }
  }
  if (!authorization) return NextResponse.json({ message: "Unauthorized - Please sign in" }, { status: 401 })

  try {
    const body = method === "GET" || method === "DELETE" ? undefined : await request.text()
    const response = await fetch(`${API_BASE_URL}${upstreamPath}`, {
      method,
      headers: { Authorization: authorization, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
      body,
      cache: "no-store",
    })
    const text = await response.text()
    if (!text) return new NextResponse(null, { status: response.status })
    try { return NextResponse.json(JSON.parse(text), { status: response.status }) }
    catch { return NextResponse.json({ message: text }, { status: response.status }) }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Upstream request failed" }, { status: 502 })
  }
}

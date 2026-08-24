import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const account = await auth.api.getAccessToken({ headers: request.headers, body: { providerId: "keycloak" } })
    if (!account?.accessToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ accessToken: account.accessToken }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ message: "Could not get access token" }, { status: 401 })
  }
}

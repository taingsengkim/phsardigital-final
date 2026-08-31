import { NextRequest, NextResponse } from "next/server"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

/** GET /api/v1/purchases/{uuid} — one order with automatic seller fallback if needed. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params

  // 1. Try direct /api/v1/purchases/{uuid}
  const directRes = await proxyAuthenticated(
    request,
    `/api/v1/purchases/${encodeURIComponent(uuid)}`,
  )

  if (directRes.status === 200) {
    return directRes
  }

  // 2. If direct lookup returns non-200 (e.g. 404 or 403 when called by a seller),
  // lookup via seller orders search endpoint:
  try {
    const sellerRes = await proxyAuthenticated(
      request,
      `/api/v1/purchases/seller/orders?search=${encodeURIComponent(uuid)}&pageSize=5`,
    )
    if (sellerRes.status === 200) {
      const data = await sellerRes.json()
      const list = Array.isArray(data) ? data : data?.content
      if (Array.isArray(list)) {
        const found = list.find(
          (p: any) => p.uuid === uuid || p.uuid?.toLowerCase() === uuid.toLowerCase(),
        )
        if (found) {
          return NextResponse.json(found, { status: 200 })
        }
      }
    }
  } catch (err) {
    console.error("Failed to query seller orders fallback:", err)
  }

  return directRes
}

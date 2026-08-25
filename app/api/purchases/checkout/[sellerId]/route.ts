import { NextRequest } from "next/server"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

/** POST /api/v1/purchases/checkout/{sellerId} — turns one seller's cart into an order. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> },
) {
  const { sellerId } = await params
  return proxyAuthenticated(
    request,
    `/api/v1/purchases/checkout/${encodeURIComponent(sellerId)}`,
  )
}

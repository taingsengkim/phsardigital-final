import { NextRequest } from "next/server"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

/** GET /api/v1/purchases/seller/orders/summary */
export async function GET(request: NextRequest) {
  return proxyAuthenticated(
    request,
    "/api/v1/purchases/seller/orders/summary",
  )
}

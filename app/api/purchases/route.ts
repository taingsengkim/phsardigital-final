import { NextRequest } from "next/server"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

/** GET /api/v1/purchases — the signed-in buyer's own orders. */
export async function GET(request: NextRequest) {
  const query = new URL(request.url).search
  return proxyAuthenticated(request, `/api/v1/purchases${query}`)
}

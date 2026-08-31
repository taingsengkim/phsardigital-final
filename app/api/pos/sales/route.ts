import { NextRequest } from "next/server"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

/** POST /api/v1/pos/sales — Records an in-person / walk-in POS sale */
export async function POST(request: NextRequest) {
  return proxyAuthenticated(request, "/api/v1/pos/sales")
}

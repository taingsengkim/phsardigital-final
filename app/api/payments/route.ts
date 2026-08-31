import { NextRequest } from "next/server"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

/**
 * GET /api/v1/payments — the CALLING seller's own payment history. This is
 * scoped to the bearer token upstream, so it is never an admin ledger.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pageNumber = searchParams.get("pageNumber") ?? "0"
  const pageSize = searchParams.get("pageSize") ?? "20"
  return proxyAuthenticated(
    request,
    `/api/v1/payments?pageNumber=${encodeURIComponent(pageNumber)}&pageSize=${encodeURIComponent(pageSize)}`,
  )
}

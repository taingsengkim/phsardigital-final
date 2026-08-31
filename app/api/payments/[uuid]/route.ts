import { NextRequest } from "next/server"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

/** GET /api/v1/payments/{uuid} — one payment, without asking Bakong. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params
  return proxyAuthenticated(request, `/api/v1/payments/${encodeURIComponent(uuid)}`)
}

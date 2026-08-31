import { NextRequest } from "next/server"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

/**
 * POST /api/v1/payments/{uuid}/verify — asks Bakong whether the transfer
 * landed and activates the subscription when it has. The client polls this,
 * so upstream 502/503/504 must reach the caller unchanged: they mean the
 * payment network was unreachable, not that the seller failed to pay.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params
  return proxyAuthenticated(
    request,
    `/api/v1/payments/${encodeURIComponent(uuid)}/verify`,
  )
}

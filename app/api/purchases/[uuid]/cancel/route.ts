import { NextRequest } from "next/server"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

/** PATCH /api/v1/purchases/{uuid}/cancel */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params
  return proxyAuthenticated(
    request,
    `/api/v1/purchases/${encodeURIComponent(uuid)}/cancel`,
  )
}

import { NextRequest } from "next/server"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

export async function POST(request: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  return proxyAuthenticated(request, `/api/v1/listings/${encodeURIComponent(uuid)}/images`)
}

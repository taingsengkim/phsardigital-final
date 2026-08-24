import { NextRequest } from "next/server"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

type Context = { params: Promise<{ path: string[] }> }
async function upstream(request: NextRequest, context: Context) {
  const { path } = await context.params
  return `/api/v1/reviews/${path.map(encodeURIComponent).join("/")}${new URL(request.url).search}`
}
export async function POST(request: NextRequest, context: Context) { return proxyAuthenticated(request, await upstream(request, context)) }
export async function PATCH(request: NextRequest, context: Context) { return proxyAuthenticated(request, await upstream(request, context)) }
export async function DELETE(request: NextRequest, context: Context) { return proxyAuthenticated(request, await upstream(request, context)) }

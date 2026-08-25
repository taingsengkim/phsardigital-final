import { NextRequest } from "next/server"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

export function GET(request: NextRequest) { return proxyAuthenticated(request, "/api/v1/conversations") }
export function POST(request: NextRequest) { return proxyAuthenticated(request, "/api/v1/conversations") }

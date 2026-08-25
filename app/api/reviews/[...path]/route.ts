import { NextRequest, NextResponse } from "next/server"
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy"

type Context = { params: Promise<{ path: string[] }> }
async function upstream(request: NextRequest, context: Context) {
  const { path } = await context.params
  return `/api/v1/reviews/${path.map(encodeURIComponent).join("/")}${new URL(request.url).search}`
}
export async function GET(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const targetUrl = `https://phsardigital.quizzy.it.com/api/v1/reviews/${path.map(encodeURIComponent).join("/")}${new URL(request.url).search}`;
  try {
    const res = await fetch(targetUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Failed to fetch reviews" }, { status: 502 });
  }
}
export async function POST(request: NextRequest, context: Context) { return proxyAuthenticated(request, await upstream(request, context)) }
export async function PATCH(request: NextRequest, context: Context) { return proxyAuthenticated(request, await upstream(request, context)) }
export async function DELETE(request: NextRequest, context: Context) { return proxyAuthenticated(request, await upstream(request, context)) }

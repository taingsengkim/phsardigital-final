import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageNumber = searchParams.get("pageNumber") ?? "0";
  const pageSize = searchParams.get("pageSize") ?? "100";
  const useTree = searchParams.get("tree") === "true";

  try {
    const res = await fetch(
      useTree
        ? `${BASE_URL}/api/v1/categories/tree`
        : `${BASE_URL}/api/v1/categories?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("Error fetching categories:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to fetch categories" },
      { status: 502 }
    );
  }
}

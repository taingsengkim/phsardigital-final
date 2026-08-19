import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ message: "Invalid URL" }, { status: 400 });
    }

    // Follow redirects to get the full Google Maps destination URL containing coordinates
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const finalUrl = res.url || url;
    return NextResponse.json({ finalUrl });
  } catch (err: any) {
    console.error("Error resolving maps URL:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to resolve URL" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

/**
 * Streams a remote file through this origin so it can be shown on an HTTPS page.
 *
 * Product photos, avatars and shop logos live on MinIO, which serves plain HTTP
 * and has no TLS on its port. A browser on the HTTPS deployment upgrades such a
 * URL to https, fails to connect, and blocks the image as mixed content.
 * `next/image` already avoids this by fetching server-side and serving the
 * bytes from our own origin — but a plain <img> (avatars, address photos) has
 * no such path. This gives them one.
 *
 * Host-restricted on purpose: an endpoint that fetches an arbitrary
 * caller-supplied URL is an open proxy, usable to reach private addresses the
 * server can see and to launder traffic through this domain.
 */
const ALLOWED_HOSTS = (
  process.env.IMAGE_PROXY_ALLOWED_HOSTS ??
  "51.79.146.203:9000,files.quizzy.it.com"
)
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");
  if (!target) {
    return NextResponse.json({ message: "Missing url parameter" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ message: "Invalid url parameter" }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ message: "Unsupported protocol" }, { status: 400 });
  }
  if (!ALLOWED_HOSTS.includes(parsed.host.toLowerCase())) {
    return NextResponse.json({ message: "Host not allowed" }, { status: 403 });
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      // The file store is the source of truth; the CDN cache below does the work.
      cache: "no-store",
      headers: { Accept: "image/*" },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { message: `Upstream responded ${upstream.status}` },
        { status: upstream.status === 404 ? 404 : 502 },
      );
    }

    const contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      // A MinIO error is an XML document, not a picture — do not pass it off as one.
      return NextResponse.json(
        { message: "Upstream did not return an image" },
        { status: 502 },
      );
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to fetch the file",
      },
      { status: 502 },
    );
  }
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileUrl(objectName?: string | null): string {
  if (!objectName) return "";
  if (
    objectName.startsWith("http://") ||
    objectName.startsWith("https://") ||
    objectName.startsWith("/")
  ) {
    return objectName;
  }
  const baseUrl =
    process.env.NEXT_PUBLIC_FILE_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  return baseUrl ? `${baseUrl.replace(/\/$/, "")}/${objectName}` : objectName;
}

/**
 * Makes a file URL safe to put in a plain <img> on an HTTPS page.
 *
 * The file store serves plain HTTP with no TLS available, so a browser on the
 * deployed site blocks those URLs as mixed content and the picture simply never
 * appears. Routing them through /api/files/proxy means the request is
 * same-origin HTTPS and the server does the HTTP fetch.
 *
 * Only http:// needs this. https, data:, blob: and relative paths are already
 * displayable and pass through untouched. Images rendered with `next/image` do
 * not need it either — the optimizer already fetches them server-side.
 */
export function displayImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://")) {
    return `/api/files/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}


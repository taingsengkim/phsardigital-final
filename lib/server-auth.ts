import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com";

/**
 * Bearer header for an upstream call: an explicit Authorization header if the
 * caller sent one, otherwise the session's Keycloak access token.
 */
export async function getAuthHeader(
  request: NextRequest
): Promise<string | null> {
  const forwarded = request.headers.get("authorization");
  if (forwarded) return forwarded;

  try {
    const account = await auth.api.getAccessToken({
      headers: request.headers,
      body: { providerId: "keycloak" },
    });
    return account?.accessToken ? `Bearer ${account.accessToken}` : null;
  } catch (err) {
    console.error("Failed to acquire access token:", err);
    return null;
  }
}

/** Parse an upstream response body, tolerating empty and non-JSON payloads. */
export async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Message from an unknown thrown value, without resorting to `any`. */
export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

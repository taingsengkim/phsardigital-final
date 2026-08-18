/**
 * Client-side API fetch helper.
 * Safe to import in "use client" components.
 *
 * Reads the Bearer token stored in sessionStorage by the /auth/callback page.
 * Checks token expiry before every call — expired tokens are cleared so the
 * next button click redirects to login instead of sending a dead token.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://phsardigital.quizzy.it.com";

/** Returns a valid access token or null if missing / expired */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const token     = sessionStorage.getItem("kc_access_token");
  const expiresAt = Number(sessionStorage.getItem("kc_expires_at") ?? "0");
  if (!token || Date.now() >= expiresAt) {
    // clear stale tokens so buttons know the user is logged out
    sessionStorage.removeItem("kc_access_token");
    sessionStorage.removeItem("kc_refresh_token");
    sessionStorage.removeItem("kc_expires_at");
    return null;
  }
  return token;
}

/** True if a non-expired token exists in sessionStorage */
export function isLoggedIn(): boolean {
  return getAccessToken() !== null;
}

/** Save current page then go to login */
export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("kc_return_to", window.location.pathname);
  window.location.href = "/auth/login";
}

/** Generic authenticated fetch — use in "use client" components */
export async function clientFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

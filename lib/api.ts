/**
 * API helpers — two separate fetch utilities:
 *
 * 1. clientFetch  — for "use client" components (reads token from sessionStorage)
 * 2. apiFetch     — for Server Components / Route Handlers (reads token from session)
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://phsardigital.quizzy.it.com";

/* ─────────────────────────────────────────────────────────────────────────
   CLIENT-SIDE HELPERS
   Safe to import in any "use client" component.
   Token is stored in sessionStorage by /auth/callback after Keycloak login.
───────────────────────────────────────────────────────────────────────── */

/** Returns a valid access token or null if missing / expired */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const token     = sessionStorage.getItem("kc_access_token");
  const expiresAt = Number(sessionStorage.getItem("kc_expires_at") ?? "0");
  if (!token || Date.now() >= expiresAt) {
    sessionStorage.removeItem("kc_access_token");
    sessionStorage.removeItem("kc_refresh_token");
    sessionStorage.removeItem("kc_expires_at");
    return null;
  }
  return token;
}

/** True if a non-expired token exists */
export function isLoggedIn(): boolean {
  return getAccessToken() !== null;
}

/** Save current page then redirect to login */
export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("kc_return_to", window.location.pathname);
  window.location.href = "/auth/login";
}

/** Authenticated fetch for "use client" components */
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

/* ─────────────────────────────────────────────────────────────────────────
   SERVER-SIDE HELPER
   For Server Components and Route Handlers only.
   Do NOT import in "use client" files.
───────────────────────────────────────────────────────────────────────── */

/**
 * Authenticated fetch for Server Components.
 * Tries to get the token from the kc_access_token cookie (set by middleware)
 * or falls back to an unauthenticated request for public endpoints.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const apiBase = process.env.API_BASE_URL ?? "https://phsardigital.quizzy.it.com";

  // Dynamically import next/headers so this file stays importable client-side
  // (the import will only actually run on the server)
  let token: string | undefined;
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    token = jar.get("kc_access_token")?.value;
  } catch {
    // running on the client or middleware — skip
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

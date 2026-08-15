/**
 * Client-side API fetch helper.
 * Safe to import in "use client" components.
 *
 * Reads the Bearer token that the login page stores in sessionStorage
 * after a successful Keycloak ROPC (Resource Owner Password Credentials) exchange.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://phsardigital.quizzy.it.com";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("kc_access_token");
}

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

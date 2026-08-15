/**
 * Server-side API fetch helper.
 * Only import this in Server Components, Route Handlers, or server actions.
 * Do NOT import in "use client" components — it will break the build.
 *
 * Reads the Bearer token from the NextAuth session (requires next-auth configured).
 */

// Dynamically import so this never gets bundled into client code
import type { Session } from "next-auth";

const BASE = process.env.API_BASE_URL ?? "https://phsardigital.quizzy.it.com";

async function getServerSession(): Promise<Session | null> {
  try {
    // Lazy import so Next.js doesn't bundle next-auth server code into client
    const { auth } = await import("next-auth");
    // next-auth v5 exports auth() directly
    return (await (auth as () => Promise<Session | null>)()) ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getServerSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken as string}`;
  }

  const res = await fetch(`${BASE}${path}`, {
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

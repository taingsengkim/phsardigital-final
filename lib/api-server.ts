/**
 * Server-side API fetch helper.
 * Only import this in Server Components, Route Handlers, or server actions.
 * Do NOT import in "use client" components — it will break the build.
 *
 * Reads the Bearer token from the NextAuth session (requires next-auth configured).
 */

// Dynamically import so this never gets bundled into client code
// import type { Session } from "next-auth";

// const BASE = process.env.API_BASE_URL ?? "https://phsardigital.quizzy.it.com";

// async function getServerSession(): Promise<Session | null> {
//   try {
//     // Lazy import so Next.js doesn't bundle next-auth server code into client
//     const { auth } = await import("next-auth");
//     // next-auth v5 exports auth() directly
//     return (await (auth as () => Promise<Session | null>)()) ?? null;
//   } catch {
//     return null;
//   }
// }

// export async function apiFetch<T = unknown>(
//   path: string,
//   options: RequestInit = {}
// ): Promise<T> {
//   const session = await getServerSession();

//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     ...(options.headers as Record<string, string>),
//   };

//   if (session?.accessToken) {
//     headers["Authorization"] = `Bearer ${session.accessToken as string}`;
//   }

//   const res = await fetch(`${BASE}${path}`, {
//     ...options,
//     headers,
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
//   }

//   if (res.status === 204) return null as T;
//   return res.json() as Promise<T>;
// }

// import type { Session } from "next-auth";
// // Replace this path with wherever your NextAuth v5 configuration is exported
// import { auth } from "@/auth";

// // Module-level base URL fallback
// const BASE = process.env.API_BASE_URL ?? "https://phsardigital.quizzy.it.com";

// // Custom Session type extension to account for custom property 'accessToken'
// interface ExtendedSession extends Session {
//   accessToken?: string;
// }

// /**
//  * Server-side API fetch helper.
//  * Only use this in Server Components, Route Handlers, or Server Actions.
//  */
// export async function apiFetch<T = unknown>(
//   path: string,
//   options: RequestInit = {}
// ): Promise<T> {
//   // Fetch session directly using NextAuth v5's auth helper
//   const session = (await auth()) as ExtendedSession | null;

//   // Construct headers cleanly
//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     ...(options.headers as Record<string, string>),
//   };

//   // Attach Bearer token if present
//   if (session?.accessToken) {
//     headers["Authorization"] = `Bearer ${session.accessToken}`;
//   }

//   // Execute request
//   const res = await fetch(`${BASE}${path}`, {
//     ...options,
//     headers,
//     cache: options.cache ?? "no-store",
//   });

//   // Handle errors
//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
//   }

//   // Handle empty 204 No Content response
//   if (res.status === 204) {
//     return null as T;
//   }

//   return res.json() as Promise<T>;
// }
import "server-only";
import { cookies } from "next/headers";

const BASE = process.env.API_BASE_URL ?? "https://phsardigital.quizzy.it.com";

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const jar = await cookies();
  const token = jar.get("kc_access_token")?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    cache: options.cache ?? "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}
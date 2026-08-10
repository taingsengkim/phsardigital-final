import { auth } from "@/auth";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const session = await auth();
  if (!session?.accessToken) throw new Error("Not authenticated");

  const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const account = await auth.api.getAccessToken({
    headers: await headers(),
    body: { providerId: "keycloak" },
  });
  if (!account?.accessToken) throw new Error("Not authenticated");

  const res = await fetch(process.env.API_BASE_URL + path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: "Bearer " + account.accessToken,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("API error " + res.status + ": " + text);
  }
  return res.json();
}

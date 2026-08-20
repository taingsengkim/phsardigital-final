<<<<<<< HEAD
/**
 * Auth API — maps to /api/v1/auth
 * Real endpoints from: https://phsardigital.quizzy.it.com/swagger-ui/index.html
 *
 * POST /api/v1/auth/register  → register a new user
 *
 * Login is handled by Keycloak SSO via NextAuth — see auth.ts in root.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://phsardigital.quizzy.it.com";

export type RegisterPayload = {
  username: string;       // 3–50 chars, letters/numbers/._-
  password: string;       // 8–128 chars
  confirmPassword: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;    // 9–11 digits
};

export type RegisterResponse = {
  userId: string;
  username: string;
  email: string;
=======
export interface RegisterPayload {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
>>>>>>> origin/main
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

<<<<<<< HEAD
/** POST /api/v1/auth/register */
export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const res = await fetch(`${BASE}/api/v1/auth/register`, {
=======
export interface RegisterResponse {
  userId?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  [key: string]: unknown;
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const res = await fetch(`/api/auth/register`, {
>>>>>>> origin/main
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

<<<<<<< HEAD
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(err?.message ?? `Register failed: ${res.status}`);
  }

  return res.json();
=======
  const text = await res.text();
  let data: any = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    let message = "Registration failed";
    if (typeof data === "string") {
      message = data;
    } else if (data && typeof data === "object") {
      if (Array.isArray(data.errorDetails) && data.errorDetails.length > 0) {
        message = data.errorDetails
          .map((d: any) => d.fieldMessage || d.message || d.field)
          .filter(Boolean)
          .join(", ");
      } else {
        message =
          data.message ||
          data.error ||
          data.detail ||
          `Registration failed (${res.status})`;
      }
    }

    throw new Error(message);
  }

  return data as RegisterResponse;
>>>>>>> origin/main
}


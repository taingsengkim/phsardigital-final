const BASE_URL = "";

export interface RegisterPayload {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export async function registerUser(payload: RegisterPayload) {
  const res = await fetch(`/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      typeof data === "string"
        ? data
        : (data as { message?: string; error?: string; detail?: string } | null)?.message ||
        (data as { message?: string; error?: string; detail?: string } | null)?.error ||
        (data as { message?: string; error?: string; detail?: string } | null)?.detail ||
        `Registration failed (${res.status})`;

    throw new Error(typeof message === "string" ? message : "Registration failed");
  }

  return data;
}

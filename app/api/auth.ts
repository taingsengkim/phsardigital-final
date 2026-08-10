export interface RegisterPayload {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

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
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

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
}


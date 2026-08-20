<<<<<<< HEAD
/**
 * Auth client — replaces better-auth with our sessionStorage-based
 * Keycloak Authorization Code flow.
 *
 * Drop-in for any component that previously called authClient.signIn.oauth2().
 */

const KC_ISSUER = "https://auth.quizzy.it.com/realms/phsardigital";
const KC_CLIENT = "phsardigital-client";

function getCallbackUri() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/auth/callback`;
}

export const authClient = {
  signIn: {
    /** Redirect to Keycloak login — mirrors the better-auth oauth2 API */
    oauth2({ callbackURL }: { providerId?: string; callbackURL?: string }) {
      const state = crypto.randomUUID();
      sessionStorage.setItem("kc_state",    state);
      sessionStorage.setItem("kc_callback", callbackURL ?? "/home");

      const params = new URLSearchParams({
        response_type: "code",
        client_id:     KC_CLIENT,
        redirect_uri:  getCallbackUri(),
        scope:         "openid email profile",
        state,
      });

      window.location.href =
        `${KC_ISSUER}/protocol/openid-connect/auth?${params}`;
    },
  },

  /** Sign out — clear tokens and redirect to login */
  signOut() {
    sessionStorage.removeItem("kc_access_token");
    sessionStorage.removeItem("kc_refresh_token");
    sessionStorage.removeItem("kc_expires_at");
    sessionStorage.removeItem("kc_state");
    window.location.href = "/auth/login";
  },

  /** Read the current session from sessionStorage */
  getSession() {
    if (typeof window === "undefined") return null;
    const token     = sessionStorage.getItem("kc_access_token");
    const expiresAt = Number(sessionStorage.getItem("kc_expires_at") ?? "0");
    if (!token || Date.now() >= expiresAt) return null;
    return { accessToken: token, expiresAt };
  },

  /** True if a valid (non-expired) token exists */
  isLoggedIn() {
    return this.getSession() !== null;
  },
};
=======
import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [genericOAuthClient()],
});

export const { useSession } = authClient;

/**
 * Signs out from better-auth local session and redirects the browser to Keycloak's
 * RP-Initiated Logout endpoint to terminate the Keycloak SSO session as well.
 */
export async function logoutFromKeycloak(redirectPath: string = "/") {
  try {
    await authClient.signOut();
  } catch (error) {
    console.error("Error signing out from auth client:", error);
  }

  const issuer =
    process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER ||
    "https://auth.quizzy.it.com/realms/phsardigital";
  const clientId =
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "phsardigital-client";

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    const redirectUri = `${origin}${redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`}`;
    const cleanIssuer = issuer.replace(/\/$/, "");
    const logoutUrl = `${cleanIssuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${encodeURIComponent(clientId)}`;

    window.location.href = logoutUrl;
  }
}

>>>>>>> origin/main

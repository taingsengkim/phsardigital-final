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

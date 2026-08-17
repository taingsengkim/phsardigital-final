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


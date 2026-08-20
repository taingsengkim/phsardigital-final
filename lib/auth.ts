import { betterAuth } from "better-auth";
import { genericOAuth, keycloak } from "better-auth/plugins/generic-oauth";

const clientId = process.env.KEYCLOAK_CLIENT_ID;
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
const issuer = process.env.KEYCLOAK_ISSUER;

if (!clientId || !clientSecret || !issuer) {
  throw new Error(
    "KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET, and KEYCLOAK_ISSUER are required.",
  );
}

export const auth = betterAuth({
  appName: "Phsar Digital",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days (604800s)
    updateAge: 24 * 60 * 60, // Refresh session age every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      strategy: "jwe",
      refreshCache: true,
    },
  },
  account: {
    encryptOAuthTokens: false,
    storeStateStrategy: "cookie",
  },
  plugins: [
    genericOAuth({
      config: [
        keycloak({
          clientId,
          clientSecret,
          issuer,
          scopes: ["openid", "profile", "email"],
          pkce: true,
        }),
      ],
    }),
  ],
});

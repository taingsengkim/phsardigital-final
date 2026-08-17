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
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "jwe",
      refreshCache: true,
    },
  },
  account: {
    encryptOAuthTokens: true,
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
        }),
      ],
    }),
  ],
});

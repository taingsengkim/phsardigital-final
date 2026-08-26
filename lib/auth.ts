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

/**
 * Better Auth rejects any POST whose Origin is not in `trustedOrigins`, and
 * that list defaults to exactly one entry: `new URL(baseURL).origin`. A
 * BETTER_AUTH_URL still pointing at localhost in a deployed environment
 * therefore 403s every sign-in with INVALID_ORIGIN — and, worse, hands
 * Keycloak a localhost `redirect_uri`.
 *
 * Better Auth's own base-URL resolution has no Vercel fallback (it reads
 * BETTER_AUTH_URL / NEXT_PUBLIC_BETTER_AUTH_URL / PUBLIC_BETTER_AUTH_URL /
 * BASE_URL and then the request), so the deployment URL is resolved here.
 * VERCEL_URL is the current deployment, which lets previews trust themselves
 * without a `*.vercel.app` wildcard that would trust everyone else's too.
 */
const vercelHost =
  process.env.VERCEL_ENV === "production"
    ? (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL)
    : process.env.VERCEL_URL;
const vercelURL = vercelHost ? `https://${vercelHost}` : undefined;

const configuredURL = process.env.BETTER_AUTH_URL?.trim();
const configuredIsLocal = /^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(
  configuredURL ?? "",
);

/* A deployed build never uses a localhost BETTER_AUTH_URL, so the .env value
   carried up from a developer machine cannot break the deployment. */
const baseURL =
  configuredURL && !(configuredIsLocal && vercelURL)
    ? configuredURL
    : (vercelURL ?? configuredURL ?? "http://localhost:3000");

/* The production domain stays trusted from preview deployments too, so a
   preview opened against the production API is not locked out. */
const productionURL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;

const trustedOrigins = [
  ...new Set([baseURL, vercelURL, productionURL].filter(Boolean) as string[]),
];

export const auth = betterAuth({
  appName: "Phsar Digital",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins,
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

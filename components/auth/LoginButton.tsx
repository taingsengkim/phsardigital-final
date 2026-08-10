import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "../ui/button";

export default function LoginButton() {
  //   const KEYCLOAK_LOGIN_URL =
  //     "https://auth.quizzy.it.com/realms/phsardigital/protocol/openid-connect/auth?client_id=security-admin-console&redirect_uri=https%3A%2F%2Fauth.quizzy.it.com%2Fadmin%2Fphsardigital%2Fconsole%2F%23%2Fphsardigital%2Fusers&state=3fe56814-1df5-4f74-ac2f-5309b43920f3&response_mode=query&response_type=code&scope=openid&nonce=f73f6de8-076b-46db-9492-a7baacb5aa07&code_challenge=AIogSONZV7L534kxzT9G7_w4HREOpyrvGpxCfkTqcsQ&code_challenge_method=S256";

  async function handleKeycloakSignIn() {
    await authClient.signIn.oauth2({
      providerId: "keycloak",
      callbackURL: "http://localhost:3000",
    });
  }
  return (
    <Button
      onClick={handleKeycloakSignIn}
      aria-label="Login"
      style={{
        background: "#6C4CD8",
        color: "#fff",
        borderRadius: 999,
        padding: "8px 14px",
        fontSize: 13,
        fontWeight: 700,
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      Login
    </Button>
  );
}

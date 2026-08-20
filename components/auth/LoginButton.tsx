"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";

export default function LoginButton() {
  async function handleKeycloakSignIn() {
    await authClient.signIn.oauth2({ providerId: "keycloak", callbackURL: "/" });
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

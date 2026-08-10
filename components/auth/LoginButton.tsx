import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function LoginButton() {
  async function handleKeycloakSignIn() {
    await signIn("keycloak", { callbackUrl: "/" });
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

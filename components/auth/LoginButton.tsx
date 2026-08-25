"use client";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { NAV_PILL } from "@/components/layout/nav-pill";

export default function LoginButton({
  className = "",
}: {
  className?: string;
}) {
  async function handleKeycloakSignIn() {
    await authClient.signIn.oauth2({ providerId: "keycloak", callbackURL: "/" });
  }
  return (
    <button
      type="button"
      onClick={handleKeycloakSignIn}
      aria-label="Login"
      className={cn(
        NAV_PILL,
        "bg-[#6C4CD8] text-white transition-colors hover:bg-[#5B3DC0]",
        className,
      )}
    >
      Login
    </button>
  );
}

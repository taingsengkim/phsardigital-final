"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";

export default function LoginButton() {
  const [loggedIn, setLoggedIn] = useState(false);

  /* check session once on mount (client-only) */
  useEffect(() => {
    setLoggedIn(authClient.isLoggedIn());
  }, []);

  if (loggedIn) {
    return (
      <Button
        onClick={() => authClient.signOut()}
        aria-label="Sign out"
        style={{
          background: "#6C4CD8",
          color: "#fff",
          borderRadius: 999,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Sign Out
      </Button>
    );
  }

  return (
    <Button
      onClick={() =>
        authClient.signIn.oauth2({
          providerId:  "keycloak",
          callbackURL: "/home",
        })
      }
      aria-label="Login"
      style={{
        background: "#6C4CD8",
        color: "#fff",
        borderRadius: 999,
        padding: "8px 14px",
        fontSize: 13,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      Login
    </Button>
  );
}

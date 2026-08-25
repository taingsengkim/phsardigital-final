"use client";

import Link from "next/link";

/**
 * Sits beside <LoginButton /> for signed-out visitors.
 *
 * Login is the solid pill, so this one is outlined — the pair reads as one
 * control rather than two competing calls to action. Login goes straight to
 * Keycloak; registering happens on our own page first.
 */
export default function RegisterButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <Link
      href="/auth/register"
      aria-label="Create an account"
      className={className}
      style={{
        background: "#fff",
        color: "#6C4CD8",
        border: "1.5px solid #6C4CD8",
        borderRadius: 999,
        padding: "7px 14px",
        fontSize: 13,
        fontWeight: 700,
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "nowrap",
        flexShrink: 0,
        lineHeight: 1.2,
      }}
    >
      Register
    </Link>
  );
}

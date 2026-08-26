"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { NAV_PILL } from "@/components/layout/nav-pill";

/**
 * Sits beside <LoginButton /> for signed-out visitors.
 *
 * Login is the solid pill, so this one is outlined — the pair reads as one
 * control rather than two competing calls to action. Login goes straight to
 * Keycloak; registering happens on our own page first. Both share NAV_PILL so
 * the pair is the same height as each other and as the icon buttons.
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
      className={cn(
        NAV_PILL,
        "border-[1.5px] border-[#6C4CD8] bg-white text-[#6C4CD8] transition-colors hover:bg-[#F1EFFA]",
        className,
      )}
    >
      Register
    </Link>
  );
}

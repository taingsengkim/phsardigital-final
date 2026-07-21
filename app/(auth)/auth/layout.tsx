"use client";

import type { ReactNode } from "react";

// Auth pages are standalone (no public navbar/footer)
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}



import type { ReactNode } from "react";

// Products layout: sidebar lives inside page.tsx so category/[slug] can
// render its own sidebar variant. This layout is intentionally minimal.
export default function ProductsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

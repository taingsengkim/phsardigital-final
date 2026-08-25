"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/layout/navbar-component-01"
import Footer from "@/components/layout/Footer"

export default function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideFooter = pathname === "/messages" || pathname.startsWith("/messages/")

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 bg-background text-foreground">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  )
}

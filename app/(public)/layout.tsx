import type { ReactNode } from "react";
import Navbar from "@/components/layout/navbar-component-01";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#111827] flex flex-col">
      <Navbar />
      <main className="flex-1 bg-white text-[#111827]">{children}</main>
      <Footer />
    </div>
  );
}

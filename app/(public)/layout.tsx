import type { ReactNode } from "react";
import NavbarPage from "../navbar-component-01/page";
import Footer from "@/components/layout/Footer";
import NewsletterSection from "@/components/layout/NewsletterSection";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavbarPage />
      <main className="flex-1">{children}</main>
      <NewsletterSection />
      <Footer />
    </>
  );
}

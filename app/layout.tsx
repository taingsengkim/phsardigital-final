import { ThemeProvider } from "@/components/theme-provider";
import { Inter, Playfair_Display } from "next/font/google";
import StoreProvider from "@/app/StoreProvider";
import { CartFavoritesProvider } from "@/lib/context/cart-favorites-context";
import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

import { getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Phsar Digital",
  description:
    "Phsar Digital is Cambodia's leading digital e-commerce marketplace for discovering and buying online products.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
      style={{ fontSize: "85%" }}
    >
      <body
        className={`${inter.className} ${playfair.variable} min-h-full flex flex-col text-base antialiased`}
      >
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <CartFavoritesProvider>
              {children}
              <Toaster />
            </CartFavoritesProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

import { ThemeProvider } from "@/components/theme-provider";
import { Inter, Playfair_Display } from "next/font/google";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";
import { Metadata } from "next";

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

export const metadata: Metadata = {
  title: "Phasar Digital",
  description: "Phasar Digital is a powerful and user-friendly platform that provides a comprehensive suite of tools for managing and analyzing data.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`} style={{ fontSize: "85%" }}>
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
              {children}
            </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

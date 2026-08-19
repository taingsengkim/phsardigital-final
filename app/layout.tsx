import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";
import {Metadata} from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
    title: "Phasar Digital",
    description: "Phasar Digital is a powerful and user-friendly platform that provides a comprehensive suite of tools for managing and analyzing data. With its intuitive interface and robust features, QuBase enables users to efficiently organize, visualize, and derive insights from their data, making it an essential solution for businesses and individuals seeking to harness the power of information.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable} style={{ fontSize: "85%" }}>
      <body
        className={`${inter.className} min-h-full flex flex-col text-base antialiased`}
      >
        <StoreProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

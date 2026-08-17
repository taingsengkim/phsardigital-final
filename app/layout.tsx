import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});



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

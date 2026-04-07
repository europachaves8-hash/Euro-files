import type { Metadata } from "next";
import { SupabaseAuthProvider } from "@/components/supabase-auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Euro Files",
  description: "Euro Files — Professional ECU Tuning Files",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter Tight', sans-serif" }}>
        <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SchemeProvider } from "@/context/SchemeContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SchemeWise | Government Scheme Eligibility Checker",
  description: "Rule-based portal mapping citizens to eligible government schemes, explaining requirements, and assisting with application guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-white text-black">
        <AuthProvider>
          <SchemeProvider>
            {children}
          </SchemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import WebSocketClient from "@/components/WebSocketClient";
import PaymentNotification from "@/components/PaymentNotification";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SiteWorks - Registration",
  description: "Complete your SiteWorks registration to get started",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased h-screen overflow-hidden`}
      >
        <AuthProvider>
          {children}
          <WebSocketClient />
          <PaymentNotification />
          <Toaster 
            position="bottom-right" 
            richColors
            toastOptions={{
              style: {
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid',
              },
              success: {
                style: {
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderColor: '#059669',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#10b981',
                },
              },
              error: {
                style: {
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderColor: '#dc2626',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#ef4444',
                },
              },
              warning: {
                style: {
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  borderColor: '#d97706',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#f59e0b',
                },
              },
              info: {
                style: {
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderColor: '#2563eb',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#3b82f6',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from "@/lib/store";
import { ToastProvider } from "@/components/ui/Toast";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { GlobalNotificationToast } from "@/components/ui/GlobalNotificationToast";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

// Note: metadata export is not supported in client components
// Move metadata to a separate layout.metadata.ts if needed

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
        suppressHydrationWarning
      >
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ToastProvider>
              <ServiceWorkerProvider>
                <NotificationProvider>
                  {children}
                  <GlobalNotificationToast />
                </NotificationProvider>
              </ServiceWorkerProvider>
            </ToastProvider>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}

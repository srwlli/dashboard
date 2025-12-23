import type { Metadata, Viewport } from 'next';
import PWAInitializer from '@/components/PWAInitializer';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'CodeRef Dashboard',
  description: 'Modular widget dashboard with PWA and Electron support',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0c0c0e" />
      </head>
      <body className="min-h-screen bg-ind-bg text-ind-text font-display">
        <PWAInitializer />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}

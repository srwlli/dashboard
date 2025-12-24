import type { Metadata, Viewport } from 'next';
import RootClientWrapper from '@/components/RootClientWrapper';
import { ThemeProvider } from '@/contexts/ThemeContext';
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0c0c0e" />

        {/* Load shared core before any widgets */}
        <script src="/widgets/core.js"></script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              const theme = localStorage.getItem('coderef-dashboard-theme') || 'dark';
              if (theme === 'light') {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
              } else {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-ind-bg text-ind-text font-display">
        <ThemeProvider>
          <RootClientWrapper>
            {children}
          </RootClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

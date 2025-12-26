import type { Metadata, Viewport } from 'next';
import RootClientWrapper from '@/components/RootClientWrapper';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AccentColorProvider } from '@/contexts/AccentColorContext';
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

              const accentColors = {
                red: { base: '#FF1744', hover: '#FF0040' },
                orange: { base: '#FF6600', hover: '#FF5500' },
                yellow: { base: '#FFFF00', hover: '#FFEE00' },
                green: { base: '#00FF41', hover: '#00EE38' },
                purple: { base: '#BB00FF', hover: '#AA00FF' },
                blue: { base: '#00D4FF', hover: '#00BBFF' }
              };

              const accentColor = localStorage.getItem('coderef-dashboard-accent-color') || 'orange';
              const color = accentColors[accentColor] || accentColors.orange;
              document.documentElement.style.setProperty('--color-ind-accent', color.base);
              document.documentElement.style.setProperty('--color-ind-accent-hover', color.hover);
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-ind-bg text-ind-text font-display">
        <ThemeProvider>
          <AccentColorProvider>
            <RootClientWrapper>
              {children}
            </RootClientWrapper>
          </AccentColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { JetBrains_Mono as FontMono } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ReactQueryProvider } from '@/components/providers/react-query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Header } from '@/components/layout/Header';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SuppressHydrationWarning } from './providers';

// Font configuration
const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
});

// Metadata
export const metadata: Metadata = {
  title: 'Code-Craft | Modern Code Editor',
  description: 'A modern, responsive code editor with support for multiple languages, code execution, and snippet sharing.',
  keywords: ['code editor', 'programming', 'IDE', 'snippets', 'code execution'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${fontSans.variable} ${fontMono.variable}`}>
        {/* Skip navigation link for keyboard users */}
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        
        <SuppressHydrationWarning>
          <ThemeProvider>
            <ReactQueryProvider>
              <AuthProvider>
                <AuthGuard>
                  <ResponsiveLayout header={<Header />}>
                    {children}
                  </ResponsiveLayout>
                </AuthGuard>
              </AuthProvider>
            </ReactQueryProvider>
          </ThemeProvider>
        </SuppressHydrationWarning>
      </body>
    </html>
  );
} 
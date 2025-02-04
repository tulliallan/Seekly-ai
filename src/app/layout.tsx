import "./globals.css";
import './styles/animations.css';
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seekly - AI-Powered Research Assistant',
  description: 'Your intelligent research companion powered by AI',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

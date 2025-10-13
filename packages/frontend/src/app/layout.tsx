import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Provider } from '@/components/ui/provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mycelium app',
  description: 'DeFi yield in your app in minutes',
  openGraph: {
    title: 'Mycelium app',
    description: 'DeFi yield in your app in minutes',
    images: ['/og-image.png'],
    type: 'website',
    siteName: 'Mycelium app',
    locale: 'en_US',
    url: 'https://mycelium.sh',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}

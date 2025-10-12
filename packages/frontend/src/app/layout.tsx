import type { Metadata } from 'next';
import { Provider } from '@/components/ui/provider';

export const metadata: Metadata = {
  title: 'Mycelium app demo',
  description: 'Web3 yield gateway with Mycelium SDK',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}

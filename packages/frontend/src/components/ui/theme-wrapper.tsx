'use client';

import { useEffect, useState } from 'react';
import { ColorModeProvider } from './color-mode';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return <ColorModeProvider>{children}</ColorModeProvider>;
}

'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ThemeWrapper } from './theme-wrapper';

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ThemeWrapper>{children}</ThemeWrapper>
    </ChakraProvider>
  );
}

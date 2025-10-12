import { Flex } from '@chakra-ui/react';

export const AppContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex
      flexDir="column"
      minH="100vh"
      p={8}
      align="center"
      justify="center"
      alignItems="center"
      gap={4}
    >
      {children}
    </Flex>
  );
};

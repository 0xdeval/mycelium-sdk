"use client";

import { useState } from "react";
import { Box, Container, Heading, SimpleGrid } from "@chakra-ui/react";
import WalletCreator from "@/components/WalletCreator";
import WalletInfo from "@/components/WalletInfo";
import VaultCard from "@/components/VaultCard";
import VaultMonitor from "@/components/VaultMonitor";

export default function Home() {
  const [walletId, setWalletId] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  return (
    <Box minH="100vh" p={8} bg="gray.50">
      <Container maxW="6xl">
        <Heading as="h1" size="2xl" textAlign="center" mb={8}>
          Mycelium Wallet Creator
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
          <Box bg="white" p={6} borderRadius="lg" boxShadow="lg">
            <WalletCreator
              onWalletCreated={(id, address) => {
                setWalletId(id);
                setWalletAddress(address);
                setError("");
              }}
              onError={(err) => setError(err)}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </Box>

          <Box bg="white" p={6} borderRadius="lg" boxShadow="lg">
            <WalletInfo
              walletId={walletId}
              walletAddress={walletAddress}
              error={error}
            />
          </Box>
          
          <Box bg="white" p={6} borderRadius="lg" boxShadow="lg">
            <VaultCard 
              walletId={walletId}
              walletAddress={walletAddress}
            />
          </Box>
          
          <Box bg="white" p={6} borderRadius="lg" boxShadow="lg">
            <VaultMonitor />
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}

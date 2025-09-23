'use client';

import { useState } from 'react';
import { Box, Heading, VStack, Text, Input, Button } from '@chakra-ui/react';

interface Props {
  onWalletCreated: (id: string, address: string) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function WalletCreator({
  onWalletCreated,
  onError,
  isLoading,
  setIsLoading,
}: Props) {
  const [userId, setUserId] = useState('');

  const handleCreateWallet = async () => {
    if (!userId.trim()) {
      onError('Please enter a user ID');
      return;
    }

    setIsLoading(true);
    onError('');

    try {
      const response = await fetch(`/api/sdk/get-wallet/${userId}`);
      const data = await response.json();

      console.log('response after get wallet: ', data);
      if (data.found) {
        onWalletCreated(data.walletId, data.address);
        setUserId('');
        return;
      } else {
        console.log('creating wallet for user: ', userId);
        const response = await fetch(`/api/sdk/create-wallet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const data = await response.json();
        onWalletCreated(data.walletId, data.walletAddress);
        setUserId('');
        return;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Create Wallet
      </Heading>

      <VStack gap={4} align="stretch">
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
            User ID
          </Text>
          <Input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your user ID"
            disabled={isLoading}
            bg={isLoading ? 'gray.100' : 'white'}
          />
        </Box>

        <Button
          onClick={handleCreateWallet}
          disabled={isLoading || !userId.trim()}
          colorScheme="blue"
          size="lg"
          width="100%"
        >
          {isLoading ? 'Creating Wallet...' : 'Create Wallet'}
        </Button>
      </VStack>

      <Box mt={4}>
        <Text fontSize="sm" color="gray.600" mb={2}>
          • Enter a unique user ID to create or retrieve your wallet
        </Text>
        <Text fontSize="sm" color="gray.600" mb={2}>
          • If a wallet already exists for this ID, it will be retrieved
        </Text>
        <Text fontSize="sm" color="gray.600">
          • Your wallet ID will be stored locally for future sessions
        </Text>
      </Box>
    </Box>
  );
}

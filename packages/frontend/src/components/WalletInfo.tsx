'use client';

import { useState, useEffect } from 'react';
import { FaLock } from 'react-icons/fa';
import { Box, Heading, Text, VStack, Code, Icon, Button, Spinner } from '@chakra-ui/react';
import { CustomAlert } from '@/components/ui/alert';
import { type WalletInfoProps, type WalletData } from '@/types/wallet';

export default function WalletInfo({ walletId, walletAddress, error }: WalletInfoProps) {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const loadWalletData = async () => {
    if (!walletId) {
      return;
    }
    setIsLoadingData(true);
    setDataError(null);

    try {
      const response = await fetch(`/api/sdk/get-balance/${walletId}`);
      const { balances } = await response.json();

      console.log('tokensBalances in WalletInfo: ', balances);
      setWalletData({ balances });
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Failed to load wallet data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const dropFunds = async () => {
    if (!walletId) {
      return;
    }
    setIsLoadingData(true);
    setDataError(null);

    try {
      const response = await fetch(`http://localhost:3001/drop-funds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: walletAddress,
          amountUsdc: '100',
          amountEth: '0.1',
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('data after drop funds: ', data);

      await loadWalletData();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Failed to drop funds');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (walletId) {
      loadWalletData();
    }
  }, [walletId]);

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Wallet Information
      </Heading>

      {error && (
        <Box
          mb={4}
          p={4}
          bg="red.50"
          border="1px"
          borderColor="red.200"
          borderRadius="md"
          color="red.600"
        >
          <Text fontWeight="bold">Error!</Text>
          <Text>{error}</Text>
        </Box>
      )}

      {walletId && walletAddress ? (
        <VStack gap={4} align="stretch">
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
              Wallet ID
            </Text>
            <Box p={3} bg="gray.50" border="1px" borderColor="gray.200" borderRadius="md">
              <Code fontSize="sm" wordBreak="break-all">
                {walletId}
              </Code>
            </Box>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
              Wallet Address
            </Text>
            <Box p={3} bg="gray.50" border="1px" borderColor="gray.200" borderRadius="md">
              <Code fontSize="sm" wordBreak="break-all">
                {walletAddress}
              </Code>
            </Box>
          </Box>

          {isLoadingData ? (
            <Box textAlign="center" p={4}>
              <Spinner size="md" />
              <Text mt={2} fontSize="sm" color="gray.600">
                Loading wallet data...
              </Text>
            </Box>
          ) : dataError ? (
            <CustomAlert title="Error occurred" body={dataError} />
          ) : walletData ? (
            <VStack gap={3} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
                  Balance
                </Text>
                <Box p={3} bg="blue.50" border="1px" borderColor="blue.200" borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold" color="blue.700">
                    {walletData &&
                      walletData?.balances
                        .map((balance) => balance.formattedBalance + ' ' + balance.symbol)
                        .join(', ')}
                  </Text>
                </Box>
              </Box>

              <Button onClick={loadWalletData} size="sm" colorScheme="blue" variant="solid">
                Refresh Data
              </Button>
              <Button onClick={dropFunds} size="sm" colorScheme="grey" variant="outline">
                Get funds
              </Button>
            </VStack>
          ) : null}

          <Box
            mt={6}
            p={4}
            bg="green.50"
            border="1px"
            borderColor="green.200"
            borderRadius="md"
            color="green.700"
          >
            <Text fontWeight="bold">Wallet Ready!</Text>
            <Text mt={2} fontSize="sm">
              Your wallet has been successfully created or retrieved. You can now use it for
              transactions on the blockchain.
            </Text>
          </Box>
        </VStack>
      ) : (
        <Box textAlign="center" p={8}>
          <Box mb={4}>
            <Icon as={FaLock} fontSize="5xl" color="gray.400" />
          </Box>
          <Text color="gray.500" mb={2}>
            No wallet created yet
          </Text>
          <Text fontSize="sm" color="gray.400">
            Enter a user ID and create your wallet to get started
          </Text>
        </Box>
      )}
    </Box>
  );
}

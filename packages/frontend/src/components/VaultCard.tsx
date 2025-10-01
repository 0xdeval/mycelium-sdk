'use client';

import { useState, useEffect } from 'react';
import { Box, Heading, VStack, Text, Button, Input, HStack, Spinner, Code } from '@chakra-ui/react';
import type { JSX } from '@emotion/react/jsx-runtime';
import type { VaultBalance } from '@mycelium-sdk/core';

interface VaultCardProps {
  walletId?: string;
  walletAddress?: string;
}

export default function VaultCard({ walletId, walletAddress }: VaultCardProps): JSX.Element {
  const [vaultBalance, setVaultBalance] = useState<VaultBalance | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (walletId && walletAddress) {
      loadVaultBalance();
    }
  }, [walletId, walletAddress]);

  const loadVaultBalance = async () => {
    if (!walletAddress) {
      return;
    }
    console.log('===loadVaultBalance===', walletId, walletAddress);

    try {
      const response = await fetch(`/api/sdk/vault-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId,
        }),
      });

      const data = await response.json();

      console.log('Balance data >>>>> ', data);
      if (data.success) {
        setVaultBalance(data.balance || { shares: '0', depositedAmount: '0', ppfs: '0' });
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Failed to load vault balance:', err);
      setError(`Failed to load balance: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeposit = async () => {
    if (!walletId || !walletAddress || !depositAmount) {
      setError('Missing required data for deposit');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/sdk/vault-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId,
          amount: depositAmount,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Deposit successful! Transaction hash: ${data.hash}`);
        setDepositAmount('');
        await loadVaultBalance();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(`Deposit failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!walletId || !withdrawAmount) {
      setError('Missing required data for withdraw');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/sdk/vault-withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId,
          amount: withdrawAmount,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Withdraw successful! Transaction hash: ${data.hash}`);
        setWithdrawAmount('');
        await loadVaultBalance();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(`Withdraw failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawAll = async () => {
    if (!walletId || !walletAddress) {
      setError('Missing required data for withdraw all');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/sdk/vault-withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId,
          amount: undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Withdraw all successful! Transaction hash: ${data.hash}`);
        await loadVaultBalance();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(`Withdraw all failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!walletId || !walletAddress) {
    return (
      <Box>
        <Heading size="lg" mb={4}>
          Beefy Vault Operations
        </Heading>
        <Text>Please create a wallet first to interact with vaults</Text>
      </Box>
    );
  }

  console.log('VaultBalance >>>>> ', vaultBalance);
  return (
    <Box>
      <Heading size="lg" mb={4}>
        Beefy Vault Operations
      </Heading>

      {error && (
        <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200" mb={4}>
          <Text color="red.600">{error}</Text>
        </Box>
      )}

      {success && (
        <Box p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200" mb={4}>
          <Text color="green.600">{success}</Text>
        </Box>
      )}

      <VStack gap={4} align="stretch">
        {/* Current Balance */}
        <Box p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
          <Text fontWeight="bold" color="green.700" mb={2}>
            Your Vault Balance
          </Text>
          {vaultBalance ? (
            <VStack gap={1} align="stretch">
              <Text fontSize="lg" fontWeight="bold">
                {vaultBalance.shares} vault tokens
              </Text>
              <Text fontSize="sm" color="green.600">
                Price Per Full Share: {vaultBalance.ppfs}
              </Text>
              <Text fontSize="sm" color="green.600">
                Value: {vaultBalance.depositedAmount} USDC
              </Text>
            </VStack>
          ) : (
            <Text color="green.600">Loading balance...</Text>
          )}
          <Button size="sm" colorScheme="green" variant="outline" mt={2} onClick={loadVaultBalance}>
            Refresh Balance
          </Button>
        </Box>

        {/* Deposit Section */}
        <Box>
          <Text fontWeight="bold" mb={2}>
            Deposit USDC
          </Text>
          <HStack gap={2}>
            <Input
              placeholder="Amount to deposit"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={isLoading}
            />
            <Button
              colorScheme="blue"
              onClick={handleDeposit}
              disabled={isLoading || !depositAmount}
              minW="100px"
            >
              {isLoading ? <Spinner size="sm" /> : 'Deposit'}
            </Button>
          </HStack>
        </Box>

        {/* Withdraw Section */}
        {vaultBalance && parseFloat(vaultBalance.shares) > 0 && (
          <>
            <Box>
              <Text fontWeight="bold" mb={2}>
                Withdraw USDC
              </Text>
              <HStack gap={2}>
                <Input
                  placeholder="Amount to withdraw"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  colorScheme="orange"
                  onClick={handleWithdraw}
                  disabled={isLoading || !withdrawAmount}
                  minW="100px"
                >
                  {isLoading ? <Spinner size="sm" /> : 'Withdraw'}
                </Button>
              </HStack>
            </Box>

            {/* Withdraw All */}
            <Box>
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleWithdrawAll}
                disabled={isLoading}
                width="100%"
              >
                {isLoading ? <Spinner size="sm" /> : 'Withdraw All'}
              </Button>
            </Box>
          </>
        )}

        {/* Debug Info */}
        <Box p={3} bg="gray.50" borderRadius="md">
          <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">
            Debug Info:
          </Text>
          <Code fontSize="xs" wordBreak="break-all">
            Wallet: {walletAddress}
          </Code>
          <br />
        </Box>
      </VStack>
    </Box>
  );
}

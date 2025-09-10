"use client";

import { useState, useEffect } from "react";
import { 
  Box, 
  Heading, 
  VStack, 
  Text, 
  Button, 
  Input, 
  HStack,
  Badge,
  Spinner,
  Code
} from "@chakra-ui/react";

interface VaultCardProps {
  walletId?: string;
  walletAddress?: string;
}

export default function VaultCard({ walletId, walletAddress }: VaultCardProps) {
  const [vaultInfo, setVaultInfo] = useState<any>(null);
  const [vaultBalance, setVaultBalance] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Инициализация протокола и тестового vault
  useEffect(() => {
    if (walletId && walletAddress) {
      initializeVault();
    }
  }, [walletId, walletAddress]);

  const initializeVault = async () => {
    try {
      const testVaultInfo = {
        id: "morpho-steakhouse-usdc",
        name: "USDC",
        token: "USDC",
        tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        tokenDecimals: 6,
        earnContractAddress: "0xbBA4D1CEcc111BDC74bD2f95050Fb11aCB3b8A5E",
        earnedToken: "mooMorpho-Steakhouse-USDC",
        earnedTokenAddress: "0xbBA4D1CEcc111BDC74bD2f95050Fb11aCB3b8A5E",
        earnedTokenDecimals: 6,
        oracle: "tokens",
        oracleId: "USDC",
        status: "active",
        createdAt: 1738747621,
        platformId: "morpho",
        assets: ["USDC"],
        migrationIds: [],
        risks: [
          "COMPLEXITY_LOW",
          "IL_NONE",
          "MCAP_MEDIUM",
          "AUDIT",
          "CONTRACTS_VERIFIED"
        ],
        strategyTypeId: "single",
        network: "ethereum",
        zaps: [
          {
            strategyId: "single"
          }
        ],
        isGovVault: false,
        type: "standard",
        chain: "ethereum",
        strategy: "0xdCEe3AE4f82Bd085fF147B87a754517d8CAafF3b",
        pricePerFullShare: "1028897364641329041",
        lastHarvest: 1755347807
      };
      
      setVaultInfo(testVaultInfo);
      await loadVaultBalance();
    } catch (err) {
      setError(`Failed to initialize vault: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const loadVaultBalance = async () => {
    if (!vaultInfo || !walletAddress) return;
    
    try {
      const response = await fetch(`/api/sdk/vault-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId,
          walletAddress,
          vaultInfo,
          chainId: 31337
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setVaultBalance(data.balance);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Failed to load vault balance:", err);
      setError(`Failed to load balance: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeposit = async () => {
    if (!vaultInfo || !walletId || !walletAddress || !depositAmount) {
      setError("Missing required data for deposit");
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
          walletAddress,
          vaultInfo,
          amount: depositAmount,
          chainId: 31337
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess(`Deposit successful! Transaction hash: ${data.hash}`);
        setDepositAmount("");
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
    if (!vaultInfo || !walletId || !walletAddress || !withdrawAmount) {
      setError("Missing required data for withdraw");
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
          walletAddress,
          vaultInfo,
          amount: withdrawAmount,
          chainId: 31337
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess(`Withdraw successful! Transaction hash: ${data.hash}`);
        setWithdrawAmount("");
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
    if (!vaultInfo || !walletId || !walletAddress) {
      setError("Missing required data for withdraw all");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/sdk/vault-withdraw-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId,
          walletAddress,
          vaultInfo,
          chainId: 31337
        })
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

      {vaultInfo && (
        <VStack gap={4} align="stretch">
          {/* Vault Info */}
          <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="bold" color="blue.700">
                {vaultInfo.name}
              </Text>
              <Badge colorScheme="green">{vaultInfo.status}</Badge>
            </HStack>
            <Text fontSize="sm" color="blue.600" mb={1}>
              Protocol: {vaultInfo.platformId?.toUpperCase() || 'BEEFY'}
            </Text>
            <Text fontSize="sm" color="blue.600">
              Token: {vaultInfo.token} → {vaultInfo.earnedToken}
            </Text>
          </Box>

          {/* Current Balance */}
          <Box p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
            <Text fontWeight="bold" color="green.700" mb={2}>
              Your Vault Balance
            </Text>
            {vaultBalance ? (
              <VStack gap={1} align="stretch">
                <Text fontSize="lg" fontWeight="bold">
                  {vaultBalance.balance / 10 ** vaultInfo.earnedTokenDecimals} {vaultInfo.earnedToken}
                </Text>
                <Text fontSize="sm" color="green.600">
                  Shares: { vaultBalance.shares / 10 ** vaultInfo.earnedTokenDecimals }
                </Text>
                <Text fontSize="sm" color="green.600">
                  Value: {vaultBalance.value / 10 ** vaultInfo.earnedTokenDecimals} {vaultInfo.token}
                </Text>
              </VStack>
            ) : (
              <Text color="green.600">Loading balance...</Text>
            )}
            <Button
              size="sm"
              colorScheme="green"
              variant="outline"
              mt={2}
              onClick={loadVaultBalance}
            >
              Refresh Balance
            </Button>
          </Box>

          {/* Deposit Section */}
          <Box>
            <Text fontWeight="bold" mb={2}>
              Deposit {vaultInfo.token}
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
                {isLoading ? <Spinner size="sm" /> : "Deposit"}
              </Button>
            </HStack>
          </Box>

          {/* Withdraw Section */}
          <Box>
            <Text fontWeight="bold" mb={2}>
              Withdraw {vaultInfo.earnedToken}
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
                {isLoading ? <Spinner size="sm" /> : "Withdraw"}
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
              {isLoading ? <Spinner size="sm" /> : "Withdraw All"}
            </Button>
          </Box>

          {/* Debug Info */}
          <Box p={3} bg="gray.50" borderRadius="md">
            <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">
              Debug Info:
            </Text>
            <Code fontSize="xs" wordBreak="break-all">
              Wallet: {walletAddress}
            </Code>
            <br />
            <Code fontSize="xs" wordBreak="break-all">
              Vault: {vaultInfo.earnContractAddress}
            </Code>
          </Box>
        </VStack>
      )}
    </Box>
  );
}

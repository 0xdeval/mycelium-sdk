import { useEffect, useState } from 'react';
import { AccountHeader } from '@/components/AccountHeader';
import { AccountInfo } from '@/components/AccountInfo';
import type { WalletData } from '@/types/wallet';
import { toaster, Toaster } from '@/components/ui/toaster';
import { Flex } from '@chakra-ui/react';
import { Ramp } from '@/components/ramp/Ramp';
interface AccountContentProps {
  userData: string;
  walletAddress: string;
  walletId: string;
}

export const AccountContent = ({ userData, walletAddress, walletId }: AccountContentProps) => {
  const [walletBalances, setWalletBalances] = useState<WalletData | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const handleUpdateWalletBalance = async () => {
    if (!walletId) {
      return;
    }
    setIsBalanceLoading(true);

    try {
      const response = await fetch(`/api/sdk/get-balance/${walletId}`);
      const { balance } = await response.json();

      setWalletBalances({ balances: balance });
    } catch (error) {
      toaster.create({
        title: 'Failed to load wallet balance',
        description: error instanceof Error ? error.message : 'Failed to load wallet data',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (walletId) {
      handleUpdateWalletBalance();
    }
  }, [userData, walletAddress, walletId]);

  return (
    <Flex flexDir="column" gap={24} align="center" justify="center" w="full">
      <Toaster />
      <Flex flexDir="column" gap={4} align="center" justify="center" w="full">
        <AccountHeader
          userData={userData}
          walletAddress={walletAddress}
          walletId={walletId}
          walletBalances={walletBalances}
          isBalanceLoading={isBalanceLoading}
          setIsBalanceLoading={setIsBalanceLoading}
          handleUpdateWalletBalance={handleUpdateWalletBalance}
        />

        <AccountInfo
          walletBalances={walletBalances}
          isBalanceLoading={isBalanceLoading}
          walletAddress={walletAddress}
          walletId={walletId}
          handleUpdateWalletBalance={handleUpdateWalletBalance}
        />
      </Flex>

      <Ramp walletId={walletId} />
    </Flex>
  );
};

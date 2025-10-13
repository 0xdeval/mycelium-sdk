import { Text, Flex, Link, Spinner } from '@chakra-ui/react';
import { CustomPopover } from '@/components/ui/popover';
import { CustomButton } from '@/components/ui/button';
import type { WalletData } from '@/types/wallet';
import { GroupedContent } from '@/components/GroupedContent';
import { toaster } from '@/components/ui/toaster';
import { formatBalance } from '@/utils';

interface AccountHeaderProps {
  userData: string;
  walletAddress: string;
  walletId: string;
  walletBalances: WalletData | null;
  isBalanceLoading: boolean;
  setIsBalanceLoading: (loading: boolean) => void;
  handleUpdateWalletBalance: () => Promise<void>;
}

export const AccountHeader = ({
  userData,
  walletAddress,
  walletId,
  walletBalances,
  isBalanceLoading,
  setIsBalanceLoading,
  handleUpdateWalletBalance,
}: AccountHeaderProps) => {
  const accountInfoItems = [
    { label: 'User', data: userData },
    { label: 'Wallet address', data: walletAddress },
    { label: 'Wallet ID', data: walletId },
  ];

  const handleTopUp = async () => {
    if (!walletId) {
      return;
    }
    setIsBalanceLoading(true);

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

      if (!data.ok) {
        toaster.create({
          title: 'Failed to drop funds',
          description: data.error,
          type: 'error',
          duration: 5000,
        });
      }

      await handleUpdateWalletBalance();
      toaster.create({
        title: 'Funds dropped successfully',
        description: 'You have received 100 USDC to your account',
        type: 'success',
        duration: 5000,
      });
    } catch (error) {
      toaster.create({
        title: 'Failed to drop funds',
        description: error instanceof Error ? error.message : 'Issue with dropping funds',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsBalanceLoading(false);
    }
  };

  return (
    <Flex
      justify="space-between"
      align="center"
      stroke="#FFFFFF 10%"
      bg="whiteAlpha.50"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="2xl"
      px={3}
      py={3}
      w={{ base: 'full', md: '40%' }}
    >
      <CustomPopover
        triggerComponent={
          <Link
            color="whiteAlpha.700"
            fontWeight="medium"
            _hover={{
              color: 'whiteAlpha.800',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
            _active={{
              color: 'whiteAlpha.800',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
            _open={{
              color: 'whiteAlpha.800',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            {userData.slice(0, 6)} {userData.length > 6 && '...'}
          </Link>
        }
        title="Account info"
        body={<GroupedContent items={accountInfoItems} />}
      />

      <Flex justify="space-between" align="center" gap={4}>
        <Text>
          <Text as="span" fontWeight="medium" color="whiteAlpha.700">
            Balance:{' '}
          </Text>
          {isBalanceLoading ? (
            <Spinner size="sm" />
          ) : walletBalances ? (
            walletBalances?.balances
              .filter((balance) => balance.symbol === 'USDC')
              .map((balance) => `$${formatBalance(balance.formattedBalance)}`)
              .join(', ')
          ) : (
            '$0'
          )}
        </Text>
        <CustomButton
          disabled={isBalanceLoading}
          px={4}
          py={2}
          h={'fit-content'}
          fontSize={'sm'}
          onClick={handleTopUp}
        >
          Top up
        </CustomButton>
      </Flex>
    </Flex>
  );
};

import { Flex, Heading, Spinner } from '@chakra-ui/react';
import { CustomButton } from '@/components/ui/button';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { VaultBalance } from '@mycelium-sdk/core';
import { CustomPopover } from '@/components/ui/popover';
import { GroupedContent } from '@/components/GroupedContent';
import { ActionDialog } from '@/components/ActionDialog';
import { formatBalance } from '@/utils';
import { toaster } from '@/components/ui/toaster';
import type { WalletData } from '@/types/wallet';

export const AccountInfo = ({
  isBalanceLoading,
  walletAddress,
  walletId,
  walletBalances,
  handleUpdateWalletBalance,
}: {
  isBalanceLoading: boolean;
  walletAddress: string;
  walletId: string;
  walletBalances: WalletData | null;
  handleUpdateWalletBalance: () => Promise<void>;
}) => {
  const [vaultBalance, setVaultBalance] = useState<VaultBalance | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositSuccess, setDepositSuccess] = useState<{ success: boolean; hash?: string } | null>(
    null,
  );
  const [withdrawSuccess, setWithdrawSuccess] = useState<{
    success: boolean;
    hash?: string;
  } | null>(null);
  const [vaultInfoItems, setVaultInfoItems] = useState<{ label: string; data: string }[]>([]);

  const usdcBalance = useMemo(() => {
    const balance = walletBalances?.balances.find((balance) => balance.symbol === 'USDC')?.balance;
    return balance ? balance.toString() : '0';
  }, [walletBalances]);

  useEffect(() => {
    if (vaultBalance && vaultBalance?.vaultInfo) {
      setVaultInfoItems([
        { label: 'Vault chain', data: vaultBalance.vaultInfo.chain },
        { label: 'Vault address', data: vaultBalance.vaultInfo.vaultAddress },
        { label: 'Vault APY', data: vaultBalance.vaultInfo.metadata?.apy?.toString() ?? '0%' },
      ]);
    }
  }, [vaultBalance]);

  const handleLoadVaultDepositedAmount = useCallback(async () => {
    if (!walletAddress) {
      return;
    }

    try {
      const response = await fetch(`/api/sdk/vault-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVaultBalance(data.balance || { shares: '0', depositedAmount: '0' });
      } else {
        toaster.create({
          title: 'Failed to load deposited amount',
          description: data.error,
          type: 'error',
          duration: 5000,
        });
      }
    } catch (err) {
      toaster.create({
        title: 'Failed to load deposited amount',
        description: err instanceof Error ? err.message : 'Unknown error',
        type: 'error',
        duration: 5000,
      });
    }
  }, [walletId, walletAddress]);

  useEffect(() => {
    if (walletId && walletAddress) {
      handleLoadVaultDepositedAmount();
    }
  }, [walletId, walletAddress, handleLoadVaultDepositedAmount]);

  const handleDeposit = async () => {
    if (!walletId || !walletAddress || !depositAmount) {
      console.error('Missing required data for deposit');
      return;
    }

    setDepositSuccess(null);

    const usdcUserBalance =
      walletBalances?.balances.find((balance) => balance.symbol === 'USDC')?.balance || 0;

    if (parseFloat(depositAmount) > usdcUserBalance) {
      toaster.create({
        title: 'Wrong amount to deposit',
        description: "You don't have enough USDC to deposit",
        type: 'error',
        duration: 5000,
      });
      return;
    }

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
        setDepositSuccess({ success: true, hash: data.hash });
        setDepositAmount('');
        await handleLoadVaultDepositedAmount();
        await handleUpdateWalletBalance();
      } else {
        toaster.create({
          title: 'Failed to deposit',
          description: data.error,
          type: 'error',
          duration: 5000,
        });
      }
    } catch (err) {
      toaster.create({
        title: 'Failed to deposit',
        description: err instanceof Error ? err.message : 'Unknown error',
        type: 'error',
        duration: 5000,
      });
    }
  };

  const handleWithdraw = async () => {
    if (!walletId || !withdrawAmount) {
      console.error('Missing required data for withdraw');
      return;
    }

    setWithdrawSuccess(null);

    const vaultUserBalance = vaultBalance?.depositedAmount || '0';
    if (parseFloat(withdrawAmount) > parseFloat(vaultUserBalance)) {
      toaster.create({
        title: 'Wrong amount to withdraw',
        description: 'The amount you are trying to withdraw is greater than the deposited amount',
        type: 'error',
        duration: 5000,
      });
      return;
    }

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
        setWithdrawSuccess({ success: true, hash: data.hash });
        setWithdrawAmount('');
        await handleLoadVaultDepositedAmount();
        await handleUpdateWalletBalance();
      } else {
        toaster.create({
          title: 'Failed to withdraw',
          description: data.error,
          type: 'error',
          duration: 5000,
        });
      }
    } catch (err) {
      toaster.create({
        title: 'Failed to withdraw',
        description: err instanceof Error ? err.message : 'Unknown error',
        type: 'error',
        duration: 5000,
      });
    }
  };

  const onDepositDialogClose = () => {
    setDepositSuccess(null);
    setDepositAmount('');
  };

  const onWithdrawDialogClose = () => {
    setWithdrawSuccess(null);
    setWithdrawAmount('');
  };

  const triggerVaultInfoButton = (
    <CustomButton
      bg="gray.800"
      color="gray.400"
      border="1px solid"
      borderColor="gray.700"
      borderRadius="full"
      h={8}
      px={4}
      py={2}
      fontSize="sm"
      _hover={{
        bg: 'gray.700',
        borderColor: 'gray.500',
      }}
      _active={{
        bg: 'gray.700',
        borderColor: 'gray.500',
      }}
      _open={{
        bg: 'gray.700',
        borderColor: 'gray.500',
      }}
    >
      Info
    </CustomButton>
  );

  return (
    <Flex
      flexDir="column"
      justify="center"
      align="center"
      stroke="#FFFFFF 10%"
      bg="whiteAlpha.50"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="2xl"
      boxShadow="0px 0px 10px 0px rgba(255, 255, 255, 0.2)"
      w={{ base: 'full', md: '60%', xl: '40%', '2xl': '30%' }}
      gap={8}
      pt={8}
      px={2}
    >
      <Flex flexDir="column" align="center" gap={2}>
        <Heading size="sm">Invested</Heading>
        <Heading size="6xl">
          {isBalanceLoading ? (
            <Spinner size="sm" />
          ) : vaultBalance ? (
            `$${formatBalance(vaultBalance?.depositedAmount)}`
          ) : (
            '$0'
          )}
        </Heading>
        {vaultBalance && vaultInfoItems.length > 0 && (
          <CustomPopover
            triggerComponent={triggerVaultInfoButton}
            title="Vault info"
            body={<GroupedContent items={vaultInfoItems} />}
          />
        )}
      </Flex>
      <Flex gap={2} py={4} px={1} w="full" flexWrap={'wrap'}>
        <ActionDialog
          balance={usdcBalance}
          handleAction={handleDeposit}
          isBalanceLoading={isBalanceLoading}
          amount={depositAmount}
          setAmount={setDepositAmount}
          title="Enter amount to invest"
          description="Enter the amount of USDC you want to invest"
          buttonText="Invest"
          type="invest"
          isOperationSuccess={depositSuccess}
          onClose={onDepositDialogClose}
        />

        {vaultBalance &&
          vaultBalance?.depositedAmount &&
          parseFloat(vaultBalance?.depositedAmount) > 0 && (
            <ActionDialog
              balance={vaultBalance?.depositedAmount}
              handleAction={handleWithdraw}
              isBalanceLoading={isBalanceLoading}
              amount={withdrawAmount}
              title="Enter amount to withdraw"
              description="Enter the amount of USDC you want to withdraw"
              buttonText="Withdraw"
              type="withdraw-funds"
              setAmount={setWithdrawAmount}
              isOperationSuccess={withdrawSuccess}
              onClose={onWithdrawDialogClose}
            />
          )}
      </Flex>
    </Flex>
  );
};

import { Flex, VStack, Field, Fieldset } from '@chakra-ui/react';
import { CustomInput } from '@/components/ui/input';
import { useState } from 'react';
import type { JSX } from '@emotion/react/jsx-runtime';
import { CustomButton } from '@/components/ui/button';

interface Props {
  onWalletCreated: (id: string, address: string, userInput: string) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const AccountCreation = ({
  onWalletCreated,
  onError,
  isLoading,
  setIsLoading,
}: Props): JSX.Element => {
  const [userId, setUserId] = useState<string | null>(null);

  const handleCreateWallet = async () => {
    console.log('userId: ', userId);
    if (!userId?.trim()) {
      onError('Please enter a user ID');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/sdk/get-wallet/${userId}`);
      const data = await response.json();

      console.log('response after get wallet: ', data);
      if (data.found) {
        onWalletCreated(data.walletId, data.address, userId);
        return;
      } else {
        console.log('creating wallet for user: ', userId);
        const response = await fetch(`/api/sdk/create-wallet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const data = await response.json();
        onWalletCreated(data.walletId, data.walletAddress, userId);
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
    <Flex justify="center" align="center" w="full">
      <VStack gap={6} align="stretch" w="full" maxW="md">
        <Fieldset.Root size="lg" maxW="md">
          <Fieldset.Content>
            <Field.Root>
              <Field.Label color="whiteAlpha.700" fontSize="sm" fontWeight="semi-bold" mb={2}>
                Email
              </Field.Label>
              <CustomInput
                type="text"
                value={userId ?? ''}
                onChange={(e) => setUserId(e.target.value)}
                disabled={isLoading}
                isLoading={isLoading}
              />
            </Field.Root>
          </Fieldset.Content>
          <CustomButton onClick={handleCreateWallet} disabled={isLoading}>
            Create account
          </CustomButton>
        </Fieldset.Root>
      </VStack>
    </Flex>
  );
};

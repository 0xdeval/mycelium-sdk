'use client';

import { useState } from 'react';
import type { JSX } from '@emotion/react/jsx-runtime';
import { AppContainer } from '@/components/Container';
import { AccountCreation } from '@/components/AccountCreation';
import { AccountContent } from '@/components/AccountContent';
import { Toaster, toaster } from '@/components/ui/toaster';

export default function Home(): JSX.Element {
  const [userInput, setUserInput] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleWalletCreated = (id: string, address: string, userInput: string) => {
    setWalletId(id);
    setWalletAddress(address);
    setUserInput(userInput);
  };

  const handleError = (err: string) => {
    toaster.create({
      title: 'Error during account creation',
      description: err,
      type: 'error',
      duration: 5000,
    });
  };

  return (
    <>
      <Toaster />
      <AppContainer>
        {walletId && walletAddress && userInput ? (
          <AccountContent userData={userInput} walletAddress={walletAddress} walletId={walletId} />
        ) : (
          <AccountCreation
            onWalletCreated={handleWalletCreated}
            onError={handleError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
      </AppContainer>
    </>
  );
}

import { useEffect, useState } from 'react';
import { CustomDialog } from '@/components/ui/dialog';
import {
  createListCollection,
  Flex,
  Skeleton,
  Spinner,
  type ListCollection,
} from '@chakra-ui/react';
import { CustomButton } from '@/components/ui/button';
import { getName } from 'country-list';
import type { RampConfigResponse } from '@mycelium-sdk/core';
import { toaster } from '@/components/ui/toaster';
import { CustomSelector } from '@/components/ui/selector';

interface RampDialogProps {
  buttonText: string;
  rampType: 'on-ramp' | 'off-ramp';
  walletId: string;
}

const codeToName = (code: string): string | undefined => {
  return getName(code.toUpperCase()) ?? undefined;
};

export const RampDialog = ({ buttonText, rampType, walletId }: RampDialogProps) => {
  const [isActionExecuting, setIsActionExecuting] = useState(false);
  const [areOptionsLoading, setAreOptionsLoading] = useState(false);

  const [rampOptions, setRampOptions] = useState<RampConfigResponse | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const [rampCountriesOptionsCollection, setRampCountriesOptionsCollection] =
    useState<ListCollection<{ label: string; value: string }>>();
  const [paymentMethodsCollection, setPaymentMethodsCollection] =
    useState<ListCollection<{ label: string; value: string }>>();

  const onClose = () => {
    setSelectedCountry(null);
    setSelectedPaymentMethod(null);
    setPaymentMethodsCollection(undefined);
    setRampCountriesOptionsCollection(undefined);
    setRampOptions(null);
  };

  const generateRampLink = async () => {
    if (!selectedCountry || !selectedPaymentMethod) {
      toaster.create({
        title: 'Please select a country and payment method',
        description: 'Please try again',
        type: 'error',
        duration: 5000,
      });
      return;
    }

    try {
      setIsActionExecuting(true);

      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000'}/cashout-success`;

      const response = await fetch(`/api/ramp/${rampType}/${walletId}`, {
        method: 'POST',
        body: JSON.stringify({
          country: selectedCountry,
          paymentMethod: selectedPaymentMethod,
          redirectLink: redirectUrl,
          amount: '100',
          tokenToSell: 'USDC',
          fiatToReceive: 'USD',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ramp link');
      }

      const data = await response.json();
      console.log(' link response', data);

      if (data.success) {
        window.open(data.data.offramp_url, '_blank');
      } else {
        toaster.create({
          title: 'Error generating ramp link',
          description: data.error,
        });
      }
    } catch (error) {
      console.error('Error generating ramp link:', error);
    }
  };

  const fetchRampOptions = async () => {
    try {
      setAreOptionsLoading(true);
      const response = await fetch(`/api/ramp/${rampType}`);

      if (!response.ok) {
        throw new Error('Failed to fetch ramp options');
      }

      const { data } = await response.json();

      setRampOptions(data);

      setRampCountriesOptionsCollection(
        createListCollection({
          items: data.countries.map(
            (country: {
              id: string;
              payment_methods: Array<{ id: string }>;
              subdivisions: Array<string>;
            }) => ({
              label: codeToName(country.id) ?? country.id,
              value: country.id,
            }),
          ),
        }),
      );
    } catch (error) {
      console.error('Error fetching ramp options:', error);
    } finally {
      setAreOptionsLoading(false);
    }
  };

  const getOptionsByCountry = (country: string) => {
    const countryOptions = rampOptions?.countries.filter((item) => item.id === country)[0];
    console.log('countryOptions', countryOptions);

    const paymentMethods = countryOptions?.payment_methods;

    if (paymentMethods) {
      setPaymentMethodsCollection(
        createListCollection({
          items: paymentMethods?.map((paymentMethod: { id: string }) => ({
            label: paymentMethod.id,
            value: paymentMethod.id,
          })),
        }),
      );
    } else {
      toaster.create({
        title: 'No payment methods found',
        description: 'Please try another country',
        type: 'error',
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    if (selectedCountry) {
      getOptionsByCountry(selectedCountry);
    }
  }, [selectedCountry]);

  return (
    <CustomDialog
      onClose={onClose}
      triggerComponent={
        <CustomButton
          bg="transparent"
          border="1px solid"
          borderColor="whiteAlpha.700"
          color="whiteAlpha.800"
          _hover={{
            bg: 'whiteAlpha.100',
            color: 'whiteAlpha.900',
          }}
          _active={{
            bg: 'whiteAlpha.100',
            color: 'whiteAlpha.900',
          }}
          _open={{
            bg: 'whiteAlpha.100',
            color: 'whiteAlpha.900',
          }}
          px={4}
          py={2}
          h={'fit-content'}
          fontSize={'sm'}
          onClick={fetchRampOptions}
        >
          {buttonText}
        </CustomButton>
      }
      title={`Select a country`}
      description={`Select a country  and a payment method to ${rampType === 'on-ramp' ? 'top up' : 'cash out'}`}
      body={
        <Skeleton loading={areOptionsLoading && !rampCountriesOptionsCollection}>
          <Flex gap={4} flexDir="column">
            <CustomSelector
              disabled={isActionExecuting}
              collection={rampCountriesOptionsCollection!}
              size="sm"
              onValueChange={(details) => setSelectedCountry(details.value[0] || '')}
            />

            <CustomSelector
              disabled={!paymentMethodsCollection || isActionExecuting}
              collection={paymentMethodsCollection!}
              size="sm"
              onValueChange={(details) => setSelectedPaymentMethod(details.value[0] || '')}
            />
          </Flex>
        </Skeleton>
      }
      isShowFooterCloseButton={false}
      actionTrigger={
        <CustomButton
          onClick={generateRampLink}
          disabled={
            !selectedCountry || !selectedPaymentMethod || areOptionsLoading || isActionExecuting
          }
        >
          {buttonText} {isActionExecuting && <Spinner size="sm" />}
        </CustomButton>
      }
    />
  );
};

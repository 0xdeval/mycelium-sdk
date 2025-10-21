import { Flex, Text } from '@chakra-ui/react';
import { FaInfoCircle } from 'react-icons/fa';
import { RampDialog } from '@/components/ramp/RampDialog';
import { Tooltip } from '@/components/ui/tooltip';

export const Ramp = ({ walletId }: { walletId: string }) => {
  return (
    <Flex
      justify="space-between"
      align="center"
      stroke="#FFFFFF 10%"
      bg="whiteAlpha.50"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="2xl"
      boxShadow="0px 0px 10px 0px rgba(255, 255, 255, 0.2)"
      px={3}
      py={3}
      w={{ base: 'full', md: '60%', xl: '40%', '2xl': '30%' }}
    >
      <Flex justify="flex-start" align="center" gap={2}>
        <Text fontSize="sm" color="whiteAlpha.700" fontWeight="medium">
          Ramp
        </Text>
        <Tooltip content="This ramp features are used as a demo to show the SDK abilities">
          <FaInfoCircle color="whiteAlpha.700" size={16} />
        </Tooltip>
      </Flex>
      <Flex justify="space-between" align="center" gap={2}>
        <RampDialog rampType="on-ramp" buttonText="Top up" walletId={walletId} />
        <RampDialog rampType="off-ramp" buttonText="Cash out" walletId={walletId} />
      </Flex>
    </Flex>
  );
};

import { Flex, Text } from '@chakra-ui/react';
import { MdDone, MdError } from 'react-icons/md';

export const StatusCircle = ({
  status,
  description,
}: {
  status: 'success' | 'error';
  description: string;
}) => {
  return (
    <Flex flexDir="column" gap={2} align="center" justify="center">
      {status === 'success' && <MdDone size={30} color="#22c55e" />}
      {status === 'error' && <MdError size={80} color="#dc2626" />}
      {description && (
        <Text fontSize="sm" color="white" fontWeight="medium">
          {description}
        </Text>
      )}
    </Flex>
  );
};

import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

interface ItemContentProps {
  label: string;
  data: string;
}

interface GroupedContentProps {
  items: ItemContentProps[];
}

export const GroupedContent = ({ items }: GroupedContentProps) => {
  return (
    <Flex flexDir="column">
      {items.map((item: ItemContentProps, index: number) => (
        <React.Fragment key={index}>
          <GroupedContentInfo key={index} label={item.label} info={item.data} />
          <br />
        </React.Fragment>
      ))}
    </Flex>
  );
};

const GroupedContentInfo = ({ label, info }: { label: string; info: string }) => {
  return (
    <Flex flexDir="column">
      <Text fontSize="sm" fontWeight="medium" color="white.400">
        {label}
      </Text>
      <Text fontSize="sm" color="whiteAlpha.600">
        {info}
      </Text>
    </Flex>
  );
};

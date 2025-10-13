import { Box, Flex, Input, Spinner, type InputProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

export const CustomInput = forwardRef<HTMLInputElement, InputProps & { isLoading?: boolean }>(
  (props, ref) => {
    const { isLoading, ...rest } = props;

    return (
      <Flex w="full" position="relative">
        <Input
          ref={ref}
          {...rest}
          stroke="#FFFFFF 10%"
          type={props.type ?? 'text'}
          placeholder={props.placeholder}
          bg={props.bg ?? 'whiteAlpha.50'}
          border={props.border ?? '1px solid'}
          borderColor={props.borderColor ?? 'whiteAlpha.100'}
          color={props.color ?? 'whiteAlpha.700'}
          borderRadius={props.borderRadius ?? 'xl'}
          _placeholder={props._placeholder ?? { color: 'whiteAlpha.400' }}
          _focus={
            props._focus ?? {
              bg: 'whiteAlpha.100',
              boxShadow: 'none',
              outline: 'none',
              borderColor: 'whiteAlpha.200',
            }
          }
          _hover={
            props._hover ?? {
              bg: 'whiteAlpha.75',
              borderColor: 'whiteAlpha.150',
            }
          }
          h={props.h ?? 12}
          pr={props.isLoading ? 12 : 4}
          css={{
            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
            '&[type=number]': {
              MozAppearance: 'textfield',
            },
          }}
        />
        {isLoading && (
          <Box
            position="absolute"
            right={3}
            top="50%"
            transform="translateY(-50%)"
            pointerEvents="none"
          >
            <Spinner size="sm" color="whiteAlpha.600" />
          </Box>
        )}
      </Flex>
    );
  },
);

CustomInput.displayName = 'CustomInput';

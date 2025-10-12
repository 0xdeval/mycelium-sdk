import { Button, type ButtonProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

export const CustomButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <Button
      ref={ref}
      {...props}
      bg={props.bg ?? 'white.700'}
      color={props.color ?? 'black'}
      borderRadius={props.borderRadius ?? 'xl'}
      h={props.h ?? 12}
      fontWeight={props.fontWeight ?? 'medium'}
      _hover={{
        bg: props._hover?.bg ?? 'white.50',
      }}
      _active={{
        bg: props._active?.bg ?? 'white.50',
      }}
      _focus={{
        boxShadow: props._focus?.boxShadow,
      }}
      transition="all 0.2s"
    />
  );
});

CustomButton.displayName = 'CustomButton';

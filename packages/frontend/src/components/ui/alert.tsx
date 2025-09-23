import { Alert } from '@chakra-ui/react';

export const CustomAlert = ({ title, body }: { title: string; body?: string }) => {
  return (
    <Alert.Root>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        {body && <Alert.Description>{body}</Alert.Description>}
      </Alert.Content>
    </Alert.Root>
  );
};

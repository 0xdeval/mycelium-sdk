import { CloseButton, Dialog, Flex, Portal } from '@chakra-ui/react';
import { CustomButton } from '@/components/ui/button';

export const CustomDialog = ({
  triggerComponent,
  title,
  body,
  actionTrigger,
  description,
  isShowFooterCloseButton,
  onClose,
  size = 'md',
}: {
  triggerComponent: React.ReactNode;
  title?: string;
  description?: string;
  body: React.ReactNode;
  isShowFooterCloseButton: boolean;
  actionTrigger: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
}) => {
  return (
    <Dialog.Root
      placement={'center'}
      onOpenChange={(details) => {
        // details.open is false when dialog is closing
        if (!details.open && onClose) {
          onClose();
        }
      }}
      size={size}
      motionPreset="slide-in-bottom"
    >
      <Dialog.Trigger asChild>{triggerComponent}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Flex flexDir="column" gap={4}>
                <Dialog.Description>{description}</Dialog.Description>
                {body}
              </Flex>
            </Dialog.Body>
            <Dialog.Footer>
              {isShowFooterCloseButton && (
                <Dialog.ActionTrigger asChild>
                  <CustomButton w="full">Okay</CustomButton>
                </Dialog.ActionTrigger>
              )}
              {actionTrigger}
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

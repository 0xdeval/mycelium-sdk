import { Popover, Portal } from '@chakra-ui/react';
import { useState } from 'react';

export const CustomPopover = ({
  triggerComponent,
  title,
  body,
}: {
  triggerComponent: React.ReactNode;
  title?: string;
  body: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Popover.Trigger asChild>{triggerComponent}</Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.CloseTrigger />
            <Popover.Arrow />
            <Popover.Body>
              <Popover.Title fontWeight="medium" mb={4}>
                {title}
              </Popover.Title>
              {body}
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

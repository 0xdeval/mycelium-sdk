import { Select, type ListCollection } from '@chakra-ui/react';

interface Props {
  disabled: boolean;
  collection: ListCollection<{ label: string; value: string }>;
  size: 'sm' | 'md' | 'lg';
  onValueChange: (details: { value: string[] }) => void;
}

export const CustomSelector = ({ disabled, collection, size, onValueChange }: Props) => {
  return (
    <Select.Root
      disabled={disabled}
      collection={collection}
      size={size}
      width="100%"
      positioning={{ strategy: 'fixed', hideWhenDetached: true }}
      onValueChange={onValueChange}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Choose a payment method" />
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content>
          {collection?.items.map((item) => (
            <Select.Item item={item} key={item.value}>
              {item.label}
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
};

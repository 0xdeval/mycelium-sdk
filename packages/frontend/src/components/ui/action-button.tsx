import { MdOutlineAttachMoney } from 'react-icons/md';
import { CustomButton } from '@/components/ui/button';
import { FaMoneyBillTrendUp } from 'react-icons/fa6';
import { BiMoneyWithdraw } from 'react-icons/bi';

export const ActionButton = ({
  type,
  onClick,
  children,
  flex = 1,
  w = 'fit-content',
  disabled = false,
}: {
  type: 'invest' | 'add-funds' | 'withdraw-funds';
  onClick?: () => void;
  children: React.ReactNode;
  flex?: number;
  w?: string;
  disabled?: boolean;
}) => {
  return (
    <CustomButton onClick={onClick} w={w} flex={flex} disabled={disabled}>
      {type === 'invest' ? (
        <MdOutlineAttachMoney />
      ) : type === 'add-funds' ? (
        <FaMoneyBillTrendUp />
      ) : (
        <BiMoneyWithdraw />
      )}
      {children}
    </CustomButton>
  );
};

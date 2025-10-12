import { useState } from 'react';
import { ActionButton } from '@/components/ui/action-button';
import { CustomDialog } from '@/components/ui/dialog';
import { CustomInput } from '@/components/ui/input';
import { Spinner } from '@chakra-ui/react';
import { StatusCircle } from '@/components/ui/status-circle';

interface ActionDialogProps {
  isBalanceLoading: boolean;
  amount: string;
  setAmount: (amount: string) => void;
  title: string;
  description: string;
  balance: string | undefined;
  buttonText: string;
  type: 'invest' | 'withdraw-funds';
  handleAction: () => Promise<void>;
  isOperationSuccess: { success: boolean; hash?: string } | null;
  onClose: () => void;
}

// TODO: Add balance to the dialog
export const ActionDialog = ({
  onClose,
  title,
  description,
  balance,
  buttonText,
  type,
  isBalanceLoading,
  amount,
  setAmount,
  handleAction,
  isOperationSuccess,
}: ActionDialogProps) => {
  const [isActionExecuting, setIsActionExecuting] = useState(false);

  console.log('balance: ', balance);

  const executeAction = async () => {
    setIsActionExecuting(true);
    await handleAction();
    setIsActionExecuting(false);
  };

  console.log('Operation progress:', isOperationSuccess, isActionExecuting);
  return (
    <CustomDialog
      onClose={onClose}
      triggerComponent={
        <ActionButton type={type} disabled={isBalanceLoading}>
          {buttonText}
        </ActionButton>
      }
      title={
        isOperationSuccess?.success === true && !isActionExecuting
          ? 'Operation successful'
          : isOperationSuccess?.success === false && !isActionExecuting
            ? 'Operation failed'
            : title
      }
      description={!isOperationSuccess ? description : undefined}
      body={
        isOperationSuccess?.success === true ? (
          <StatusCircle status={'success'} description={'Operation completed successfully'} />
        ) : isOperationSuccess?.success === false ? (
          <StatusCircle status={'error'} description={'Operation failed'} />
        ) : (
          <CustomInput
            type="number"
            placeholder="e.g. 100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isActionExecuting}
          />
        )
      }
      isShowFooterCloseButton={!!isOperationSuccess?.success}
      actionTrigger={
        !isOperationSuccess && (
          <ActionButton
            type={type}
            onClick={executeAction}
            disabled={isBalanceLoading || !amount || isActionExecuting}
          >
            {buttonText}
            {isActionExecuting && <Spinner size="sm" />}
          </ActionButton>
        )
      }
    />
  );
};

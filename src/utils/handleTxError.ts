import { toastError, toastInfo, toastWarn } from '@/utils/toast';

export const handleTxError = (e: any) => {
  if (
    e.toString().includes('block height exceeded') ||
    e.toString().includes('confirmation timeout')
  ) {
    toastInfo(
      `Confirmation expired. Don't worry, this doesn't necessarily mean the transaction has failed. Please check later.`
    );
    return;
  } else if (e.toString().includes('Simulation failed')) {
    toastError('Transaction failed. Please check your balance.');
    return;
  } else if(e.toString().toLowerCase().includes('insufficient')){
    toastError(e.message || 'Insufficient funds. Please check your balance.');
    return;
  }
  toastError('Unknow error. Please try again later.');
  throw e;
};

import { useMutation } from '@tanstack/react-query';
import { Balance } from '../../lib/types';
import { BalanceFunctionalService } from '../../lib/new/BalanceFunctionalService';
import { useToast } from '../use-toast';
import { queryClient } from '../../lib/queryClient';
import { useBalanceContext } from '../../context/BalanceContext';

export function useBalance() {
  const { toast } = useToast();
  const { balance, updateBalance: updateBalanceContext } = useBalanceContext();

  const updateBalanceMutation = useMutation({
    mutationFn: (newBalance: Balance) => BalanceFunctionalService.updateBalance(newBalance),
    onSuccess: (data) => {
      updateBalanceContext(data);
      queryClient.invalidateQueries({ queryKey: ['/api/balance'] });
      toast({
        title: "Cập nhật số dư thành công",
        description: "Số dư tài khoản đã được cập nhật",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cập nhật thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    balance,
    updateBalance: (newBalance: Balance) => updateBalanceMutation.mutate(newBalance),
    isUpdating: updateBalanceMutation.isPending
  };
}

export { BalanceProvider } from '../../context/BalanceContext';
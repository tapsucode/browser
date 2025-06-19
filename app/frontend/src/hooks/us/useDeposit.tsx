import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  DepositFunctionalService, 
  DepositRequest,
  Transaction,
  ProcessPaymentRequest
} from '../../lib/new/DepositFunctionalService';
import { useToast } from '../use-toast';
import { queryClient } from '../../lib/queryClient';
import { useBalance } from './useBalance';

/**
 * Hook chức năng để quản lý nạp tiền
 * Hook này được sử dụng trong:
 * - DepositPage
 * - Các component liên quan đến thanh toán
 */
export function useDeposit() {
  const { toast } = useToast();
  const { balance } = useBalance(); // Sử dụng hook useBalance để lấy thông tin số dư
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bank' | 'paypal' | 'crypto'>('bank');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showPaymentInfo, setShowPaymentInfo] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string>('');
  
  // Lấy lịch sử giao dịch
  const {
    data: transactionHistory = [],
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['/api/transactions/history'],
    queryFn: () => DepositFunctionalService.getTransactionHistory(),
  });

  // Lấy cấu trúc phí
  const {
    data: fees = { bank: 0.02, paypal: 0.035, crypto: 0.01 },
    isLoading: isLoadingFees
  } = useQuery({
    queryKey: ['/api/deposit/fees'],
    queryFn: () => DepositFunctionalService.getPaymentFees(),
  });

  // Lấy mệnh giá cố định
  const presetAmounts = DepositFunctionalService.getPresetAmounts();

  // Kiểm tra trạng thái giao dịch
  const checkTransactionStatus = (transactionId: string) => {
    return useQuery({
      queryKey: ['/api/deposit/status', transactionId],
      queryFn: () => DepositFunctionalService.checkTransactionStatus(transactionId),
      enabled: !!transactionId,
      refetchInterval: 10000, // Tự động kiểm tra mỗi 10 giây
    });
  };

  // Mutation tạo giao dịch nạp tiền
  const createDepositMutation = useMutation({
    mutationFn: (depositData: DepositRequest) => 
      DepositFunctionalService.createDeposit(depositData),
    onSuccess: (data) => {
      toast({
        title: "Tạo giao dịch thành công",
        description: "Vui lòng thực hiện thanh toán theo hướng dẫn",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Tạo giao dịch thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation xử lý thanh toán
  const processPaymentMutation = useMutation({
    mutationFn: (data: ProcessPaymentRequest) => 
      DepositFunctionalService.processPayment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/history'] });
      toast({
        title: data.success ? "Thanh toán thành công" : "Đang xử lý",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Xử lý thanh toán thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation tải lên bằng chứng thanh toán
  const uploadPaymentProofMutation = useMutation({
    mutationFn: ({ transactionId, file }: { transactionId: string, file: File }) => 
      DepositFunctionalService.uploadPaymentProof(transactionId, file),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Tải lên thành công",
          description: data.message,
        });
      } else {
        toast({
          title: "Tải lên thất bại",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Tải lên thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Tính phí dựa trên số tiền và phương thức thanh toán
  const calculateFee = (amount: number, paymentMethod: 'bank' | 'paypal' | 'crypto') => {
    return DepositFunctionalService.calculateFee(amount, paymentMethod);
  };

  // Lấy hướng dẫn thanh toán dựa trên phương thức
  const getPaymentInstructions = (method: 'bank' | 'paypal' | 'crypto') => {
    return DepositFunctionalService.getPaymentInstructions(method);
  };

  // Tính phí dựa trên số tiền đã chọn
  const fee = selectedAmount > 0 || parseFloat(customAmount) > 0
    ? DepositFunctionalService.calculateFee(
        selectedAmount || parseFloat(customAmount) || 0, 
        selectedPaymentMethod
      ).fee
    : 0;
    
  // Tính tổng số tiền cần thanh toán
  const totalAmount = (selectedAmount || parseFloat(customAmount) || 0) + fee;
  
  // Xử lý khi chọn mệnh giá
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };
  
  // Xử lý khi nhập số tiền tùy chỉnh
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(0);
  };
  
  // Xử lý khi chọn phương thức thanh toán
  const handlePaymentMethodChange = (method: 'bank' | 'paypal' | 'crypto') => {
    setSelectedPaymentMethod(method);
  };
  
  // Xử lý khi xác nhận thanh toán
  const handleConfirmPayment = () => {
    const amount = selectedAmount || parseFloat(customAmount) || 0;
    if (amount <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn hoặc nhập số tiền hợp lệ",
        variant: "destructive",
      });
      return;
    }
    
    // Hiển thị thông tin thanh toán
    setShowPaymentInfo(true);
    
    // Tạo giao dịch nạp tiền
    createDepositMutation.mutate({
      amount,
      paymentMethod: selectedPaymentMethod,
      currency: "USD"
    });
  };
  
  // Xử lý khi đóng thông tin thanh toán
  const handleClosePaymentInfo = () => {
    setShowPaymentInfo(false);
  };
  
  // Kiểm tra trạng thái thanh toán
  const checkPaymentStatus = (transactionId: string) => {
    processPaymentMutation.mutate({ transactionId });
  };
  
  // Sao chép vào clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Đã sao chép",
        description: "Thông tin đã được sao chép vào clipboard"
      });
    }).catch(err => {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép: " + err,
        variant: "destructive"
      });
    });
  };
  
  // Hiển thị/ẩn mã QR
  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };
  
  // Lấy chi tiết hướng dẫn thanh toán
  const paymentInfo = {
    bank: DepositFunctionalService.getPaymentInstructions('bank'),
    paypal: DepositFunctionalService.getPaymentInstructions('paypal'),
    crypto: DepositFunctionalService.getPaymentInstructions('crypto')
  };

  return {
    // State và setters
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    selectedAmount,
    customAmount,
    showPaymentInfo,
    setShowPaymentInfo,
    showQRCode, 
    currentTransactionId,
    totalAmount,
    fee,
    
    // Data
    balance, // Lấy từ hook useBalance
    transactionHistory,
    fees,
    paymentDetails: paymentInfo,
    paymentInfo,
    presetAmounts: DepositFunctionalService.getPresetAmounts(),
    isLoadingTransactions,
    isLoadingFees: isLoadingFees,
    
    // Các hàm xử lý
    handleAmountSelect,
    handleCustomAmountChange,
    handlePaymentMethodChange,
    handleConfirmPayment,
    handleClosePaymentInfo,
    checkPaymentStatus,
    copyToClipboard,
    toggleQRCode,
    
    // Các hàm truy vấn
    refetchTransactions,
    
    // Các hàm tiện ích
    calculateFee: DepositFunctionalService.calculateFee,
    getPaymentInstructions: DepositFunctionalService.getPaymentInstructions,
    
    // Mutations
    createDeposit: createDepositMutation.mutate,
    processPayment: processPaymentMutation.mutate,
    uploadPaymentProof: uploadPaymentProofMutation.mutate,
    
    // Mutation states
    isCreatingDeposit: createDepositMutation.isPending,
    isProcessingPayment: processPaymentMutation.isPending,
    isProcessingPaymentMutation: processPaymentMutation.isPending,
    isUploadingPaymentProof: uploadPaymentProofMutation.isPending,
  };
}
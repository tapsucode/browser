import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  UpgradeFunctionalService, 
  Package, 
  SelectedPackage, 
  PackageType,
  SubscriptionPeriod,
  PackageFilters
} from '../../lib/new/UpgradeFunctionalService';
import { useToast } from '../use-toast';
import { queryClient } from '../../lib/queryClient';

/**
 * Hook chức năng để quản lý nâng cấp tài khoản
 * Hook này được sử dụng trong:
 * - UpgradePage
 * - Các component liên quan đến gói dịch vụ, nâng cấp
 */
export function useUpgrade() {
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>('monthly');
  const [memberCount, setMemberCount] = useState<number>(1);
  const [activePackageType, setActivePackageType] = useState<PackageType>('cloud');
  
  // Lấy danh sách gói dịch vụ
  const getPackages = (filters?: PackageFilters) => {
    return useQuery({
      queryKey: ['/api/packages', filters],
      queryFn: () => UpgradeFunctionalService.getPackages(filters),
    });
  };

  // Lấy tất cả gói dịch vụ
  const {
    data: allPackages = [],
    isLoading: isLoadingPackages,
    error: packagesError,
    refetch: refetchPackages
  } = useQuery({
    queryKey: ['/api/packages'],
    queryFn: () => UpgradeFunctionalService.getPackages(),
  });

  // Lấy gói dịch vụ theo loại hiện tại
  const {
    data: activePackages = [],
    isLoading: isLoadingActivePackages
  } = useQuery({
    queryKey: ['/api/packages', { type: activePackageType }],
    queryFn: () => UpgradeFunctionalService.getPackages({ type: activePackageType }),
  });

  // Lấy chi tiết gói dịch vụ
  const getPackageDetails = (tier: string, type: PackageType) => {
    return useQuery({
      queryKey: ['/api/packages', tier, type],
      queryFn: () => UpgradeFunctionalService.getPackageDetails(tier, type),
      enabled: !!tier && !!type,
    });
  };

  // Lấy thông tin đăng ký hiện tại
  const {
    data: currentSubscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    refetch: refetchSubscription
  } = useQuery({
    queryKey: ['/api/user/subscription'],
    queryFn: () => UpgradeFunctionalService.getCurrentSubscription(),
  });

  // Mutation xử lý thanh toán
  const processPaymentMutation = useMutation({
    mutationFn: ({ 
      selectedPackage, 
      paymentMethod, 
      paymentDetails 
    }: { 
      selectedPackage: SelectedPackage;
      paymentMethod: string;
      paymentDetails: any;
    }) => UpgradeFunctionalService.processPayment(selectedPackage, paymentMethod, paymentDetails),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/user/subscription'] });
        toast({
          title: "Thanh toán thành công",
          description: result.message || "Gói dịch vụ của bạn đã được kích hoạt",
        });
      } else {
        toast({
          title: "Thanh toán thất bại",
          description: result.message || "Vui lòng thử lại sau",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Thanh toán thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation hủy đăng ký
  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => UpgradeFunctionalService.cancelSubscription(),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/user/subscription'] });
        toast({
          title: "Hủy đăng ký thành công",
          description: result.message || "Đăng ký của bạn đã được hủy",
        });
      } else {
        toast({
          title: "Hủy đăng ký thất bại",
          description: result.message || "Vui lòng thử lại sau",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Hủy đăng ký thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation thay đổi gói đăng ký
  const changeSubscriptionMutation = useMutation({
    mutationFn: ({ 
      newPackage, 
      period 
    }: {
      newPackage: Package;
      period: SubscriptionPeriod;
    }) => UpgradeFunctionalService.changeSubscription(newPackage, period),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/user/subscription'] });
        toast({
          title: "Thay đổi gói dịch vụ thành công",
          description: result.message || "Gói dịch vụ của bạn đã được cập nhật",
        });
      } else {
        toast({
          title: "Thay đổi gói dịch vụ thất bại",
          description: result.message || "Vui lòng thử lại sau",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Thay đổi gói dịch vụ thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Tính giá cuối cùng
  const calculateFinalPrice = (
    pkg: Package, 
    period: SubscriptionPeriod, 
    memberCount: number = 1
  ) => {
    return UpgradeFunctionalService.calculateFinalPrice(pkg, period, memberCount);
  };

  // Handler cho việc chọn gói dịch vụ
  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
  };

  // Handler cho việc thay đổi kỳ hạn
  const handleChangePeriod = (period: SubscriptionPeriod) => {
    setSelectedPeriod(period);
  };

  // Handler cho việc thay đổi số lượng thành viên
  const handleChangeMemberCount = (count: number) => {
    setMemberCount(count);
  };

  // Handler cho việc thay đổi loại gói dịch vụ
  const handleChangePackageType = (type: PackageType) => {
    setActivePackageType(type);
  };

  // Handler cho việc thanh toán
  const handleProcessPayment = (paymentMethod: string, paymentDetails: any) => {
    if (!selectedPackage) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn gói dịch vụ trước khi thanh toán",
        variant: "destructive",
      });
      return;
    }

    processPaymentMutation.mutate({
      selectedPackage: {
        package: selectedPackage,
        period: selectedPeriod,
        memberCount
      },
      paymentMethod,
      paymentDetails
    });
  };

  // Handler cho việc hủy đăng ký
  const handleCancelSubscription = () => {
    cancelSubscriptionMutation.mutate();
  };

  // Handler cho việc thay đổi gói đăng ký
  const handleChangeSubscription = (newPackage: Package, period: SubscriptionPeriod) => {
    changeSubscriptionMutation.mutate({ newPackage, period });
  };

  // Lấy thông tin giới hạn của gói dịch vụ
  const getPackageLimits = (pkg: Package) => {
    return UpgradeFunctionalService.getPackageLimits(pkg);
  };

  return {
    // State và setters
    selectedPackage,
    selectedPeriod,
    memberCount,
    activePackageType,
    setSelectedPackage: handleSelectPackage,
    setSelectedPeriod: handleChangePeriod,
    setMemberCount: handleChangeMemberCount,
    setActivePackageType: handleChangePackageType,
    
    // Data queries
    allPackages,
    activePackages,
    currentSubscription,
    isLoadingPackages,
    isLoadingActivePackages,
    isLoadingSubscription,
    packagesError,
    subscriptionError,
    refetchPackages,
    refetchSubscription,
    getPackages,
    getPackageDetails,
    
    // Handlers
    processPayment: handleProcessPayment,
    cancelSubscription: handleCancelSubscription,
    changeSubscription: handleChangeSubscription,
    
    // Utility functions
    calculateFinalPrice,
    getPackageLimits,
    
    // Mutation states
    isProcessingPayment: processPaymentMutation.isPending,
    isCancellingSubscription: cancelSubscriptionMutation.isPending,
    isChangingSubscription: changeSubscriptionMutation.isPending,
  };
}
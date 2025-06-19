import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  StoreFunctionalService,
  Product,
  Category,
  ProductFilters,
  Review
} from '../../lib/new/StoreFunctionalService';
import { useToast } from '../use-toast';
import { queryClient } from '../../lib/queryClient';

/**
 * Hook chức năng để quản lý cửa hàng
 * Hook này được sử dụng trong:
 * - StorePage
 * - Các component liên quan đến hiển thị/mua bán sản phẩm
 */
export function useStore() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<ProductFilters>({});
  
  // Lấy tất cả sản phẩm
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['/api/store/products', filters],
    queryFn: () => StoreFunctionalService.getProducts(filters),
  });
  
  // Đảm bảo products luôn là mảng
  const products = Array.isArray(productsData) ? productsData : [];

  // Lấy tất cả danh mục
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: ['/api/store/categories'],
    queryFn: () => StoreFunctionalService.getCategories(),
  });
  
  // Đảm bảo categories luôn là mảng
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // Lấy sản phẩm nổi bật
  const {
    data: featuredProductsData,
    isLoading: isLoadingFeaturedProducts
  } = useQuery({
    queryKey: ['/api/store/products/featured'],
    queryFn: () => StoreFunctionalService.getFeaturedProducts(),
  });
  
  // Đảm bảo featuredProducts luôn là mảng
  const featuredProducts = Array.isArray(featuredProductsData) ? featuredProductsData : [];

  // Lấy sản phẩm đã cài đặt
  const {
    data: installedProductsData,
    isLoading: isLoadingInstalledProducts,
    refetch: refetchInstalledProducts
  } = useQuery({
    queryKey: ['/api/store/products/installed'],
    queryFn: () => StoreFunctionalService.getInstalledProducts(),
  });
  
  // Đảm bảo installedProducts luôn là mảng
  const installedProducts = Array.isArray(installedProductsData) ? installedProductsData : [];

  // Lấy tags
  const {
    data: tagsData,
    isLoading: isLoadingTags
  } = useQuery({
    queryKey: ['/api/store/tags'],
    queryFn: () => StoreFunctionalService.getTags(),
  });
  
  // Đảm bảo tags luôn là mảng
  const tags = Array.isArray(tagsData) ? tagsData : [];

  // Lấy chi tiết sản phẩm
  const getProductDetails = (productId: string) => {
    return useQuery({
      queryKey: ['/api/store/products', productId],
      queryFn: () => StoreFunctionalService.getProductDetails(productId),
      enabled: !!productId,
    });
  };

  // Lấy reviews của sản phẩm
  const getProductReviews = (productId: string) => {
    return useQuery({
      queryKey: ['/api/store/products', productId, 'reviews'],
      queryFn: () => StoreFunctionalService.getProductReviews(productId),
      enabled: !!productId,
    });
  };

  // Mutation cài đặt sản phẩm
  const installProductMutation = useMutation({
    mutationFn: (productId: string) => StoreFunctionalService.installProduct(productId),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/store/products'] });
        queryClient.invalidateQueries({ queryKey: ['/api/store/products/installed'] });
        toast({
          title: "Cài đặt thành công",
          description: data.message || "Sản phẩm đã được cài đặt",
        });
      } else {
        toast({
          title: "Cài đặt thất bại",
          description: data.message || "Không thể cài đặt sản phẩm",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Cài đặt thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation gỡ cài đặt sản phẩm
  const uninstallProductMutation = useMutation({
    mutationFn: (productId: string) => StoreFunctionalService.uninstallProduct(productId),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/store/products'] });
        queryClient.invalidateQueries({ queryKey: ['/api/store/products/installed'] });
        toast({
          title: "Gỡ cài đặt thành công",
          description: data.message || "Sản phẩm đã được gỡ cài đặt",
        });
      } else {
        toast({
          title: "Gỡ cài đặt thất bại",
          description: data.message || "Không thể gỡ cài đặt sản phẩm",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Gỡ cài đặt thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation đánh giá sản phẩm
  const rateProductMutation = useMutation({
    mutationFn: ({ productId, rating, comment }: { productId: string, rating: number, comment?: string }) => 
      StoreFunctionalService.rateProduct(productId, rating, comment),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/store/products'] });
        toast({
          title: "Đánh giá thành công",
          description: "Cảm ơn bạn đã gửi đánh giá",
        });
      } else {
        toast({
          title: "Đánh giá thất bại",
          description: "Không thể gửi đánh giá",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Đánh giá thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation mua sản phẩm
  const purchaseProductMutation = useMutation({
    mutationFn: (productId: string) => StoreFunctionalService.purchaseProduct(productId),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/store/products'] });
        toast({
          title: "Mua thành công",
          description: data.message || "Sản phẩm đã được mua",
        });
      } else {
        toast({
          title: "Mua thất bại",
          description: data.message || "Không thể mua sản phẩm",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Mua thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handler tìm kiếm sản phẩm
  const handleSearchProducts = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, search: query }));
  };

  // Handler chọn danh mục
  const handleSelectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    setFilters(prev => ({ 
      ...prev, 
      categoryId: categoryId === 'all' ? undefined : categoryId 
    }));
  };

  // Handler áp dụng bộ lọc
  const handleApplyFilters = (newFilters: ProductFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handler cài đặt sản phẩm
  const handleInstallProduct = (productId: string) => {
    installProductMutation.mutate(productId);
  };

  // Handler gỡ cài đặt sản phẩm
  const handleUninstallProduct = (productId: string) => {
    uninstallProductMutation.mutate(productId);
  };

  // Handler đánh giá sản phẩm
  const handleRateProduct = (productId: string, rating: number, comment?: string) => {
    rateProductMutation.mutate({ productId, rating, comment });
  };

  // Handler mua sản phẩm
  const handlePurchaseProduct = (productId: string) => {
    purchaseProductMutation.mutate(productId);
  };

  return {
    // State và setters
    activeCategory,
    searchQuery,
    filters,
    setActiveCategory: handleSelectCategory,
    setSearchQuery: handleSearchProducts,
    setFilters: handleApplyFilters,
    
    // Data queries
    products,
    categories,
    featuredProducts,
    installedProducts,
    tags,
    isLoadingProducts,
    isLoadingCategories,
    isLoadingFeaturedProducts,
    isLoadingInstalledProducts,
    isLoadingTags,
    productsError,
    categoriesError,
    refetchProducts,
    refetchInstalledProducts,
    getProductDetails,
    getProductReviews,
    
    // Handlers
    installProduct: handleInstallProduct,
    uninstallProduct: handleUninstallProduct,
    rateProduct: handleRateProduct,
    purchaseProduct: handlePurchaseProduct,
    
    // Mutation states
    isInstallingProduct: installProductMutation.isPending,
    isUninstallingProduct: uninstallProductMutation.isPending,
    isRatingProduct: rateProductMutation.isPending,
    isPurchasingProduct: purchaseProductMutation.isPending,
  };
}
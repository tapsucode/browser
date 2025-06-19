import { ElectronAPIClient } from '../electron-api';
import { 
  getAllPackages, 
  getPackagesByType,
} from '../../utils/pricing';

/**
 * Service xử lý các chức năng liên quan đến nâng cấp tài khoản
 * Được sử dụng trong các pages:
 * - UpgradePage
 * - Các component liên quan đến gói dịch vụ, thanh toán
 */

// Định nghĩa các kiểu dữ liệu
export type PackageType = 'cloud' | 'local' | 'custom';
export type SubscriptionPeriod = 'monthly' | 'quarterly' | 'annual';

export interface PricingOption {
  period: SubscriptionPeriod;
  monthlyPrice: number;
  totalPrice: number;
  discount: number;
}

export interface PackageFeature {
  name: string;
  description: string;
  included: boolean;
  limit?: number | string;
}

export interface Package {
  id: string;
  tier: string;
  type: PackageType;
  name: string;
  description: string;
  pricingOptions: PricingOption[];
  features: PackageFeature[];
  popular?: boolean;
  maxProfiles?: number;
  maxWorkflows?: number;
}

export interface SelectedPackage {
  package: Package;
  period: SubscriptionPeriod;
  memberCount: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
}

export interface PackageFilters {
  type?: PackageType;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface Subscription {
  isSubscribed: boolean;
  currentPackage: Package | null;
  expiresAt: string | null;
  startedAt?: string;
  autoRenew?: boolean;
  paymentMethod?: string;
}

export const UpgradeFunctionalService = {
  /**
   * Lấy tất cả các gói dịch vụ với bộ lọc tùy chọn
   * @param filters Bộ lọc gói dịch vụ
   * @returns Promise<Package[]> Danh sách gói dịch vụ
   */
  async getPackages(filters?: PackageFilters): Promise<Package[]> {
    try {
      // Trong triển khai thực tế, sẽ gọi API
      // const response = await ElectronAPIClient.request('GET', '/api/store/packages', filters);
      // return response.json();
      
      let packages = getAllPackages();
      
      if (filters) {
        if (filters.type) {
          packages = getPackagesByType(filters.type);
        }
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          packages = packages.filter(pkg => 
            pkg.name.toLowerCase().includes(searchLower) || 
            pkg.description.toLowerCase().includes(searchLower)
          );
        }
        
        if (filters.minPrice !== undefined) {
          packages = packages.filter(pkg => 
            pkg.pricingOptions[1].monthlyPrice >= (filters.minPrice || 0)
          );
        }
        
        if (filters.maxPrice !== undefined) {
          packages = packages.filter(pkg => 
            pkg.pricingOptions[1].monthlyPrice <= (filters.maxPrice || Infinity)
          );
        }
      }
      
      return packages;
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết gói dịch vụ theo tier và loại
   * @param tier Tier của gói dịch vụ
   * @param type Loại gói dịch vụ
   * @returns Promise<Package | null> Chi tiết gói dịch vụ
   */
  async getPackageDetails(tier: string, type: PackageType): Promise<Package | null> {
    try {
      // Trong triển khai thực tế, sẽ gọi API
      // const response = await ElectronAPIClient.request('GET', `/api/store/packages/${tier}/${type}`);
      // return response.json();
      
      const allPackages = getAllPackages();
      return allPackages.find(pkg => pkg.tier === tier && pkg.type === type) || null;
    } catch (error) {
      console.error('Failed to fetch package details:', error);
      throw error;
    }
  },

  /**
   * Xử lý thanh toán cho gói dịch vụ đã chọn
   * @param selectedPackage Gói dịch vụ đã chọn
   * @param paymentMethod Phương thức thanh toán
   * @param paymentDetails Chi tiết thanh toán
   * @returns Promise<PaymentResult> Kết quả thanh toán
   */
  async processPayment(
    selectedPackage: SelectedPackage, 
    paymentMethod: string, 
    paymentDetails: any
  ): Promise<PaymentResult> {
    try {
      // Trong triển khai thực tế, sẽ gọi API
      const response = await ElectronAPIClient.request('POST', '/api/upgrade/payments', {
        packageId: `${selectedPackage.package.tier}_${selectedPackage.package.type}`,
        period: selectedPackage.period,
        memberCount: selectedPackage.memberCount,
        paymentMethod,
        paymentDetails
      });
      return response.json();
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin gói đăng ký hiện tại của người dùng
   * @returns Promise<Subscription> Thông tin đăng ký
   */
  async getCurrentSubscription(): Promise<Subscription> {
    try {
      // Trong triển khai thực tế, sẽ gọi API
      const response = await ElectronAPIClient.request('GET', '/api/upgrade/subscription');
      return response.json();
    } catch (error) {
      console.error('Failed to fetch current subscription:', error);
      throw error;
    }
  },

  /**
   * Hủy đăng ký hiện tại
   * @returns Promise<{success: boolean, message: string}> Kết quả hủy
   */
  async cancelSubscription(): Promise<{success: boolean, message: string}> {
    try {
      // Trong triển khai thực tế, sẽ gọi API
      const response = await ElectronAPIClient.request('POST', '/api/upgrade/subscription/cancel');
      return response.json();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  },

  /**
   * Thay đổi gói đăng ký
   * @param newPackage Gói dịch vụ mới
   * @param period Kỳ hạn mới
   * @returns Promise<{success: boolean, message: string}> Kết quả thay đổi
   */
  async changeSubscription(
    newPackage: Package, 
    period: SubscriptionPeriod
  ): Promise<{success: boolean, message: string}> {
    try {
      // Trong triển khai thực tế, sẽ gọi API
      const response = await ElectronAPIClient.request('POST', '/api/upgrade/subscription/change', {
        packageId: `${newPackage.tier}_${newPackage.type}`,
        period
      });
      return response.json();
    } catch (error) {
      console.error('Failed to change subscription:', error);
      throw error;
    }
  },

  /**
   * Tính giá cuối cùng dựa trên gói, kỳ hạn và số lượng thành viên
   * @param pkg Gói dịch vụ
   * @param period Kỳ hạn
   * @param memberCount Số lượng thành viên
   * @returns {totalPrice: number, savings: number} Giá cuối cùng và số tiền tiết kiệm
   */
  calculateFinalPrice(
    pkg: Package, 
    period: SubscriptionPeriod, 
    memberCount: number = 1
  ): {totalPrice: number, savings: number} {
    const pricingOption = pkg.pricingOptions.find(option => option.period === period);
    
    if (!pricingOption) {
      throw new Error(`Invalid period: ${period}`);
    }
    
    const baseMonthlyPrice = pkg.pricingOptions[0].monthlyPrice;
    const totalPrice = pricingOption.totalPrice * memberCount;
    const savings = (baseMonthlyPrice * (period === 'monthly' ? 1 : period === 'quarterly' ? 3 : 12) - pricingOption.totalPrice) * memberCount;
    
    return {
      totalPrice,
      savings
    };
  },

  /**
   * Lấy thông tin giới hạn của gói dịch vụ
   * @param pkg Gói dịch vụ
   * @returns {profiles: number, workflows: number} Giới hạn profiles và workflows
   */
  getPackageLimits(pkg: Package): {profiles: number, workflows: number} {
    return {
      profiles: pkg.maxProfiles || 0,
      workflows: pkg.maxWorkflows || 0
    };
  }
};
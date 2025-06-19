import { Package, PackageType, PricingTier, SubscriptionPeriod } from '../types/upgrade';

// Cloud packages
export const CLOUD_PACKAGES: Package[] = [
  {
    tier: 'basic',
    type: 'cloud',
    name: 'Cloud Cơ Bản',
    description: 'Giải pháp cloud đơn giản cho người dùng cá nhân',
    recommendedFor: 'Người mới bắt đầu',
    features: [
      'Tối đa 5 profile trình duyệt',
      'Cài đặt cơ bản Anti Detect',
      'Bảo vệ dấu vân tay cơ bản',
      'Hỗ trợ Email cơ bản',
    ],
    minMembers: 1,
    maxMembers: 5,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 9.99,
        totalPrice: 9.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 8.99,
        totalPrice: 53.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 7.99,
        totalPrice: 95.88,
        discount: 20,
      },
    },
  },
  {
    tier: 'advanced',
    type: 'cloud',
    name: 'Cloud Nâng Cao',
    description: 'Giải pháp cloud mạnh mẽ cho người dùng nghiêm túc',
    recommendedFor: 'Người dùng thường xuyên',
    features: [
      'Tối đa 15 profile trình duyệt',
      'Cài đặt nâng cao Anti Detect',
      'Bảo vệ dấu vân tay nâng cao',
      'Proxy tích hợp',
      'Hỗ trợ Email ưu tiên',
    ],
    minMembers: 1,
    maxMembers: 15,
    defaultMembers: 3,
    pricingOptions: {
      1: {
        monthlyPrice: 19.99,
        totalPrice: 19.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 17.99,
        totalPrice: 107.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 15.99,
        totalPrice: 191.88,
        discount: 20,
      },
    },
  },
  {
    tier: 'premium',
    type: 'cloud',
    name: 'Cloud Cao Cấp',
    description: 'Giải pháp cloud cao cấp cho các chuyên gia',
    recommendedFor: 'Chuyên gia và doanh nghiệp nhỏ',
    features: [
      'Tối đa 50 profile trình duyệt',
      'Cài đặt chuyên sâu Anti Detect',
      'Bảo vệ dấu vân tay toàn diện',
      'Proxy tích hợp cao cấp',
      'Hỗ trợ 24/7',
      'Phân tích dữ liệu',
    ],
    minMembers: 1,
    maxMembers: 50,
    defaultMembers: 5,
    pricingOptions: {
      1: {
        monthlyPrice: 39.99,
        totalPrice: 39.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 35.99,
        totalPrice: 215.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 31.99,
        totalPrice: 383.88,
        discount: 20,
      },
    },
  },
  {
    tier: 'enterprise',
    type: 'cloud',
    name: 'Cloud Doanh Nghiệp',
    description: 'Giải pháp cloud toàn diện cho doanh nghiệp lớn',
    recommendedFor: 'Doanh nghiệp lớn',
    features: [
      'Không giới hạn profile trình duyệt',
      'Cài đặt chuyên sâu Anti Detect',
      'Bảo vệ dấu vân tay cao cấp nhất',
      'Proxy tích hợp cao cấp',
      'Hỗ trợ 24/7 ưu tiên',
      'Phân tích dữ liệu nâng cao',
      'Tùy chỉnh theo yêu cầu',
      'Quản lý tài khoản chuyên biệt',
    ],
    minMembers: 10,
    maxMembers: 100,
    defaultMembers: 20,
    pricingOptions: {
      1: {
        monthlyPrice: 99.99,
        totalPrice: 99.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 89.99,
        totalPrice: 539.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 79.99,
        totalPrice: 959.88,
        discount: 20,
      },
    },
  },
];

// Local packages
export const LOCAL_PACKAGES: Package[] = [
  {
    tier: 'basic',
    type: 'local',
    name: 'Local Cơ Bản',
    description: 'Giải pháp local đơn giản cho người dùng cá nhân',
    recommendedFor: 'Người mới bắt đầu',
    features: [
      'Tối đa 5 profile trình duyệt',
      'Cài đặt cơ bản Anti Detect',
      'Bảo vệ dấu vân tay cơ bản',
      'Lưu trữ dữ liệu local',
      'Hỗ trợ Email cơ bản',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 7.99,
        totalPrice: 7.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 6.99,
        totalPrice: 41.94,
        discount: 12,
      },
      12: {
        monthlyPrice: 5.99,
        totalPrice: 71.88,
        discount: 25,
      },
    },
  },
  {
    tier: 'advanced',
    type: 'local',
    name: 'Local Nâng Cao',
    description: 'Giải pháp local mạnh mẽ cho người dùng nghiêm túc',
    recommendedFor: 'Người dùng thường xuyên',
    features: [
      'Tối đa 15 profile trình duyệt',
      'Cài đặt nâng cao Anti Detect',
      'Bảo vệ dấu vân tay nâng cao',
      'Lưu trữ dữ liệu local an toàn',
      'Hỗ trợ Email ưu tiên',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 15.99,
        totalPrice: 15.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 13.99,
        totalPrice: 83.94,
        discount: 12,
      },
      12: {
        monthlyPrice: 11.99,
        totalPrice: 143.88,
        discount: 25,
      },
    },
  },
  {
    tier: 'premium',
    type: 'local',
    name: 'Local Cao Cấp',
    description: 'Giải pháp local cao cấp cho các chuyên gia',
    recommendedFor: 'Chuyên gia và doanh nghiệp nhỏ',
    features: [
      'Tối đa 50 profile trình duyệt',
      'Cài đặt chuyên sâu Anti Detect',
      'Bảo vệ dấu vân tay toàn diện',
      'Mã hóa dữ liệu local',
      'Hỗ trợ 24/7',
      'Phân tích dữ liệu',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 29.99,
        totalPrice: 29.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 26.39,
        totalPrice: 158.34,
        discount: 12,
      },
      12: {
        monthlyPrice: 22.49,
        totalPrice: 269.88,
        discount: 25,
      },
    },
  },
  {
    tier: 'enterprise',
    type: 'local',
    name: 'Local Doanh Nghiệp',
    description: 'Giải pháp local toàn diện cho doanh nghiệp lớn',
    recommendedFor: 'Doanh nghiệp lớn',
    features: [
      'Không giới hạn profile trình duyệt',
      'Cài đặt chuyên sâu Anti Detect',
      'Bảo vệ dấu vân tay cao cấp nhất',
      'Mã hóa dữ liệu local cấp doanh nghiệp',
      'Hỗ trợ 24/7 ưu tiên',
      'Phân tích dữ liệu nâng cao',
      'Tùy chỉnh theo yêu cầu',
      'Quản lý tài khoản chuyên biệt',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 79.99,
        totalPrice: 79.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 70.39,
        totalPrice: 422.34,
        discount: 12,
      },
      12: {
        monthlyPrice: 59.99,
        totalPrice: 719.88,
        discount: 25,
      },
    },
  },
];

// Custom packages
export const CUSTOM_PACKAGES: Package[] = [
  {
    tier: 'basic',
    type: 'custom',
    name: 'Tùy Chỉnh Cơ Bản',
    description: 'Giải pháp tùy chỉnh cơ bản theo nhu cầu',
    recommendedFor: 'Người dùng có nhu cầu đặc biệt',
    features: [
      'Tùy chọn cài đặt trình duyệt',
      'Tùy chọn tối ưu hóa',
      'Tùy chọn lưu trữ dữ liệu',
      'Hỗ trợ Email tùy chỉnh',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 14.99,
        totalPrice: 14.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 13.49,
        totalPrice: 80.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 11.99,
        totalPrice: 143.88,
        discount: 20,
      },
    },
  },
  {
    tier: 'advanced',
    type: 'custom',
    name: 'Tùy Chỉnh Nâng Cao',
    description: 'Giải pháp tùy chỉnh nâng cao theo nhu cầu',
    recommendedFor: 'Người dùng chuyên nghiệp',
    features: [
      'Tùy chọn cài đặt trình duyệt nâng cao',
      'Tùy chọn tối ưu hóa nâng cao',
      'Tùy chọn lưu trữ và bảo mật',
      'Tùy chọn proxy',
      'Hỗ trợ Email ưu tiên',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 24.99,
        totalPrice: 24.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 22.49,
        totalPrice: 134.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 19.99,
        totalPrice: 239.88,
        discount: 20,
      },
    },
  },
  {
    tier: 'premium',
    type: 'custom',
    name: 'Tùy Chỉnh Cao Cấp',
    description: 'Giải pháp tùy chỉnh cao cấp toàn diện',
    recommendedFor: 'Chuyên gia và doanh nghiệp',
    features: [
      'Tùy chọn không giới hạn cho trình duyệt',
      'Tùy chọn tối ưu hóa cao cấp',
      'Tùy chọn lưu trữ và bảo mật nâng cao',
      'Tùy chọn proxy cao cấp',
      'Hỗ trợ 24/7',
      'Tùy chọn phân tích dữ liệu',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 49.99,
        totalPrice: 49.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 44.99,
        totalPrice: 269.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 39.99,
        totalPrice: 479.88,
        discount: 20,
      },
    },
  },
  {
    tier: 'enterprise',
    type: 'custom',
    name: 'Tùy Chỉnh Doanh Nghiệp',
    description: 'Giải pháp tùy chỉnh hoàn hảo cho doanh nghiệp',
    recommendedFor: 'Doanh nghiệp lớn và tổ chức',
    features: [
      'Tùy chọn không giới hạn cho mọi tính năng',
      'Tùy chọn tối ưu hóa đặc biệt',
      'Tùy chọn bảo mật doanh nghiệp',
      'Tùy chọn proxy doanh nghiệp',
      'Hỗ trợ 24/7 ưu tiên',
      'Tùy chọn phân tích dữ liệu nâng cao',
      'Tùy chỉnh API',
      'Quản lý tài khoản chuyên biệt',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 129.99,
        totalPrice: 129.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 116.99,
        totalPrice: 701.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 103.99,
        totalPrice: 1247.88,
        discount: 20,
      },
    },
  },
];

export const getAllPackages = (): Package[] => {
  return [...CLOUD_PACKAGES, ...LOCAL_PACKAGES, ...CUSTOM_PACKAGES];
};

export const getPackagesByType = (type: PackageType): Package[] => {
  switch (type) {
    case 'cloud':
      return CLOUD_PACKAGES;
    case 'local':
      return LOCAL_PACKAGES;
    case 'custom':
      return CUSTOM_PACKAGES;
    default:
      return [];
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount * 23000); // Convert USD to VND (approximate)
};

export const formatSubscriptionPeriod = (period: SubscriptionPeriod): string => {
  return period === 1 ? '1 tháng' : `${period} tháng`;
};
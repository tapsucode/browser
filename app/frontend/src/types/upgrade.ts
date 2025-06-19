export type PackageType = 'cloud' | 'local' | 'custom';
export type PricingTier = 'basic' | 'advanced' | 'premium' | 'enterprise';
export type SubscriptionPeriod = 1 | 6 | 12;

export interface PricingOption {
  monthlyPrice: number;
  totalPrice: number;
  discount: number;
}

export interface Package {
  tier: PricingTier;
  type: PackageType;
  name: string;
  description: string;
  features: string[];
  recommendedFor: string;
  minMembers: number;
  maxMembers: number;
  defaultMembers: number;
  pricingOptions: {
    [key in SubscriptionPeriod]: PricingOption;
  };
}

export interface SelectedPackage {
  package: Package;
  period: SubscriptionPeriod;
  memberCount: number;
}
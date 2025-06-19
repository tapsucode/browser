
import { PackageModel, PackageConverter } from '../models/Package';
import { SubscriptionModel, SubscriptionConverter } from '../models/Subscription';
import { TransactionModel } from '../models/Transaction';

export class UpgradeService {
  static async getPackages(filters?: {
    type?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const packages = await PackageModel.getPackages(filters);
    return packages.map(pkg => PackageConverter.toAPI(pkg));
  }

  static async getPackageDetails(tier: string, type: string) {
    const pkg = await PackageModel.findByTierAndType(tier, type);
    if (!pkg) throw new Error('Package not found');
    return PackageConverter.toAPI(pkg);
  }

  static async getCurrentSubscription(userId: number) {
    const subscription = await SubscriptionModel.findActiveWithPackage(userId);
    if (!subscription) {
      return {
        isSubscribed: false,
        currentPackage: null,
        expiresAt: null,
        startedAt: null,
        autoRenew: false,
        paymentMethod: null
      };
    }
    return SubscriptionConverter.toAPI(subscription);
  }

  static async calculatePrice(
    packageId: string,
    period: 'monthly' | 'quarterly' | 'annual',
    memberCount: number = 1
  ) {
    const pkg = await PackageModel.getPackageById(packageId);
    if (!pkg) throw new Error('Package not found');

    let basePrice = 0;
    let discount = 0;

    switch (period) {
      case 'monthly':
        basePrice = pkg.priceMonthly;
        break;
      case 'quarterly':
        basePrice = pkg.priceMonthly * 3;
        discount = 0.1;
        break;
      case 'annual':
        basePrice = pkg.priceMonthly * 12;
        discount = 0.2;
        break;
    }

    const totalBeforeDiscount = basePrice * memberCount;
    const discountAmount = totalBeforeDiscount * discount;
    const finalPrice = totalBeforeDiscount - discountAmount;

    return {
      basePrice,
      discount,
      discountAmount,
      finalPrice,
      period,
      memberCount
    };
  }

  static async validateUpgrade(currentPackageId: string, newPackageId: string): Promise<boolean> {
    const current = await PackageModel.getPackageById(currentPackageId);
    const next = await PackageModel.getPackageById(newPackageId);
    
    if (!current || !next) return false;
    
    // Simple tier comparison - assumes tier names are comparable
    const tierOrder = ['free', 'basic', 'pro', 'enterprise'];
    const currentTierIndex = tierOrder.indexOf(current.tier.toLowerCase());
    const nextTierIndex = tierOrder.indexOf(next.tier.toLowerCase());
    
    return nextTierIndex >= currentTierIndex;
  }

  static async previewUpgrade(userId: number, packageId: string, period: 'monthly' | 'quarterly' | 'annual') {
    const currentSub = await this.getCurrentSubscription(userId);
    const newPackage = await PackageModel.getPackageById(packageId);
    
    if (!newPackage) {
      throw new Error('Package not found');
    }

    const pricing = await this.calculatePrice(packageId, period);
    const packageAPI = PackageConverter.toAPI(newPackage);
    
    return {
      currentPackage: currentSub?.currentPackage?.id || null,
      newPackage: packageAPI,
      pricing,
      changes: {
        isUpgrade: currentSub?.isSubscribed ? await this.validateUpgrade(currentSub.currentPackage?.id || '', packageId) : true,
        features: packageAPI.features
      }
    };
  }

  static async changeSubscription(
    userId: number,
    packageId: string,
    period: 'monthly' | 'quarterly' | 'annual',
    paymentMethod?: string
  ) {
    // Validate upgrade path  
    const currentSub = await SubscriptionModel.findActiveByUserId(userId);
    if (currentSub) {
      const currentPkg = await PackageModel.findById(currentSub.packageId);
      const isValidUpgrade = await this.validateUpgrade(`${currentPkg?.tier}_${currentPkg?.type}`, packageId);
      if (!isValidUpgrade) {
        throw new Error('Invalid upgrade path - Cannot downgrade to a lower tier');
      }
      await SubscriptionModel.cancel(currentSub.id);
    }

    // Calculate price and process payment
    const pricing = await this.calculatePrice(packageId, period);
    
    // Simple payment validation - in real app would integrate with payment gateway
    if (pricing.finalPrice <= 0) {
      throw new Error('Invalid pricing calculation');
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    switch (period) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'annual':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Get package by ID để lấy database ID thực tế
    const pkg = await PackageModel.getPackageById(packageId);
    if (!pkg) throw new Error('Package not found');

    // Create new subscription
    const subscription = await SubscriptionModel.create({
      userId,
      packageId: pkg.id,
      period,
      startDate,
      endDate,
      status: 'active',
      autoRenew: true
    });

    return {
      success: true,
      message: 'Subscription updated successfully'
    };
  }
}

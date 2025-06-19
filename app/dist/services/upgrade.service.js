"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpgradeService = void 0;
const Package_1 = require("../models/Package");
const Subscription_1 = require("../models/Subscription");
class UpgradeService {
    static async getPackages(filters) {
        const packages = await Package_1.PackageModel.getPackages(filters);
        return packages.map(pkg => Package_1.PackageConverter.toAPI(pkg));
    }
    static async getPackageDetails(tier, type) {
        const pkg = await Package_1.PackageModel.findByTierAndType(tier, type);
        if (!pkg)
            throw new Error('Package not found');
        return Package_1.PackageConverter.toAPI(pkg);
    }
    static async getCurrentSubscription(userId) {
        const subscription = await Subscription_1.SubscriptionModel.findActiveWithPackage(userId);
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
        return Subscription_1.SubscriptionConverter.toAPI(subscription);
    }
    static async calculatePrice(packageId, period, memberCount = 1) {
        const pkg = await Package_1.PackageModel.getPackageById(packageId);
        if (!pkg)
            throw new Error('Package not found');
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
    static async validateUpgrade(currentPackageId, newPackageId) {
        const current = await Package_1.PackageModel.getPackageById(currentPackageId);
        const next = await Package_1.PackageModel.getPackageById(newPackageId);
        if (!current || !next)
            return false;
        // Simple tier comparison - assumes tier names are comparable
        const tierOrder = ['free', 'basic', 'pro', 'enterprise'];
        const currentTierIndex = tierOrder.indexOf(current.tier.toLowerCase());
        const nextTierIndex = tierOrder.indexOf(next.tier.toLowerCase());
        return nextTierIndex >= currentTierIndex;
    }
    static async previewUpgrade(userId, packageId, period) {
        const currentSub = await this.getCurrentSubscription(userId);
        const newPackage = await Package_1.PackageModel.getPackageById(packageId);
        if (!newPackage) {
            throw new Error('Package not found');
        }
        const pricing = await this.calculatePrice(packageId, period);
        const packageAPI = Package_1.PackageConverter.toAPI(newPackage);
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
    static async changeSubscription(userId, packageId, period, paymentMethod) {
        // Validate upgrade path  
        const currentSub = await Subscription_1.SubscriptionModel.findActiveByUserId(userId);
        if (currentSub) {
            const currentPkg = await Package_1.PackageModel.findById(currentSub.packageId);
            const isValidUpgrade = await this.validateUpgrade(`${currentPkg?.tier}_${currentPkg?.type}`, packageId);
            if (!isValidUpgrade) {
                throw new Error('Invalid upgrade path - Cannot downgrade to a lower tier');
            }
            await Subscription_1.SubscriptionModel.cancel(currentSub.id);
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
        const pkg = await Package_1.PackageModel.getPackageById(packageId);
        if (!pkg)
            throw new Error('Package not found');
        // Create new subscription
        const subscription = await Subscription_1.SubscriptionModel.create({
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
exports.UpgradeService = UpgradeService;

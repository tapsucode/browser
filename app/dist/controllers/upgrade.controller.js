"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpgradeController = void 0;
const upgrade_service_1 = require("../services/upgrade.service");
const express_rate_limit_1 = require("express-rate-limit");
// Rate limiting middleware
const upgradeLimit = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10 // 10 requests per window
});
class UpgradeController {
    /**
     * Handle requests from main.js routing for /api/upgrade/*
     * Parse method and URL to call appropriate method
     */
    static async handleRequest(method, url, data, headers = {}, authenticatedUser = null) {
        try {
            // Parse URL path: /api/upgrade/packages -> /packages
            const urlParts = url.split('/').filter(part => part !== '');
            const path = '/' + urlParts.slice(2).join('/'); // Remove 'api', 'upgrade'
            switch (method) {
                case 'GET':
                    if (path === '/packages') {
                        return await this.handleGetPackages(data);
                    }
                    else if (path.match(/^\/packages\/[^\/]+\/[^\/]+$/)) {
                        // /packages/tier/type
                        const pathParts = path.split('/');
                        const tier = pathParts[2];
                        const type = pathParts[3];
                        return await this.handleGetPackageDetails(tier, type, data);
                    }
                    else if (path === '/subscription') {
                        return await this.handleGetCurrentSubscription(authenticatedUser);
                    }
                    else if (path === '/subscription/history') {
                        return await this.handleGetSubscriptionHistory(data, authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown GET route: ${path}`);
                    }
                case 'POST':
                    if (path === '/calculate-price') {
                        return await this.handleCalculatePrice(data, authenticatedUser);
                    }
                    else if (path === '/preview-upgrade') {
                        return await this.handlePreviewUpgrade(data, authenticatedUser);
                    }
                    else if (path === '/change-subscription') {
                        return await this.handleChangeSubscription(data, authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown POST route: ${path}`);
                    }
                default:
                    throw new Error(`Unknown method: ${method}`);
            }
        }
        catch (error) {
            console.error('UpgradeController.handleRequest error:', error);
            throw error;
        }
    }
    // Embedded handlers that call business logic directly
    static async handleGetPackages(data) {
        try {
            const { type, search, minPrice, maxPrice } = data;
            // Input validation
            if (minPrice && isNaN(Number(minPrice))) {
                throw new Error('Invalid minPrice parameter');
            }
            if (maxPrice && isNaN(Number(maxPrice))) {
                throw new Error('Invalid maxPrice parameter');
            }
            const packages = await upgrade_service_1.UpgradeService.getPackages({
                type: type,
                search: search,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined
            });
            return {
                success: true,
                data: packages
            };
        }
        catch (error) {
            console.error('Error getting packages:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
    static async handleGetPackageDetails(tier, type, data) {
        try {
            if (!tier || !type) {
                throw new Error('Missing required parameters');
            }
            const pkg = await upgrade_service_1.UpgradeService.getPackageDetails(tier, type);
            if (!pkg) {
                throw new Error('Package not found');
            }
            return {
                success: true,
                data: pkg
            };
        }
        catch (error) {
            console.error('Error getting package details:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to get package details');
        }
    }
    static async handleGetCurrentSubscription(authenticatedUser) {
        try {
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const subscription = await upgrade_service_1.UpgradeService.getCurrentSubscription(userId);
            return {
                success: true,
                data: subscription
            };
        }
        catch (error) {
            console.error('Error getting current subscription:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to get subscription');
        }
    }
    static async handleCalculatePrice(data, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const { tier, type, billingCycle, packageId } = data;
            if (!tier || !type) {
                throw new Error('Missing required parameters');
            }
            const priceCalculation = await upgrade_service_1.UpgradeService.calculatePrice(packageId, billingCycle);
            return {
                success: true,
                data: priceCalculation
            };
        }
        catch (error) {
            console.error('Error calculating price:', error);
            throw new Error(error instanceof Error ? error.message : 'Price calculation failed');
        }
    }
    static async handleGetSubscriptionHistory(data, authenticatedUser) {
        try {
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const { page = 1, limit = 10 } = data;
            // Use model directly since service method doesn't exist
            const { SubscriptionModel } = await Promise.resolve().then(() => __importStar(require('../models/Subscription')));
            const history = await SubscriptionModel.getSubscriptionHistory(userId);
            return {
                success: true,
                data: history,
                total: history.length
            };
        }
        catch (error) {
            console.error('Error getting subscription history:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to get subscription history');
        }
    }
    static async handlePreviewUpgrade(data, authenticatedUser) {
        try {
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const { newTier, newType, billingCycle } = data;
            if (!newTier || !newType) {
                throw new Error('Missing required parameters');
            }
            const preview = await upgrade_service_1.UpgradeService.previewUpgrade(userId, newTier, billingCycle);
            return {
                success: true,
                data: preview
            };
        }
        catch (error) {
            console.error('Error previewing upgrade:', error);
            throw new Error(error instanceof Error ? error.message : 'Upgrade preview failed');
        }
    }
    static async handleChangeSubscription(data, authenticatedUser) {
        try {
            const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const { newTier, newType, billingCycle, paymentMethod } = data;
            if (!newTier || !newType) {
                throw new Error('Missing required parameters');
            }
            const result = await upgrade_service_1.UpgradeService.changeSubscription(userId, newTier, billingCycle);
            return {
                success: true,
                data: result,
                message: 'Subscription changed successfully'
            };
        }
        catch (error) {
            console.error('Error changing subscription:', error);
            throw new Error(error instanceof Error ? error.message : 'Subscription change failed');
        }
    }
}
exports.UpgradeController = UpgradeController;

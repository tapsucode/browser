import { Request, Response } from 'express';
import { UpgradeService } from '../services/upgrade.service';
import { SubscriptionModel } from '../models/Subscription';
import { rateLimit } from 'express-rate-limit';
import { type AuthenticatedUser } from '../middleware/auth.middleware';

// Rate limiting middleware
const upgradeLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // 10 requests per window
});

export class UpgradeController {
  /**
   * Handle requests from main.js routing for /api/upgrade/*
   * Parse method and URL to call appropriate method
   */
  static async handleRequest(method: string, url: string, data: any, headers: any = {}, authenticatedUser: AuthenticatedUser | null = null): Promise<any> {
    try {
      // Parse URL path: /api/upgrade/packages -> /packages
      const urlParts = url.split('/').filter(part => part !== '');
      const path = '/' + urlParts.slice(2).join('/'); // Remove 'api', 'upgrade'
      
      switch (method) {
        case 'GET':
          if (path === '/packages') {
            return await this.handleGetPackages(data);
          } else if (path.match(/^\/packages\/[^\/]+\/[^\/]+$/)) {
            // /packages/tier/type
            const pathParts = path.split('/');
            const tier = pathParts[2];
            const type = pathParts[3];
            return await this.handleGetPackageDetails(tier, type, data);
          } else if (path === '/subscription') {
            return await this.handleGetCurrentSubscription(authenticatedUser);
          } else if (path === '/subscription/history') {
            return await this.handleGetSubscriptionHistory(data, authenticatedUser);
          } else {
            throw new Error(`Unknown GET route: ${path}`);
          }
          
        case 'POST':
          if (path === '/calculate-price') {
            return await this.handleCalculatePrice(data,authenticatedUser);
          } else if (path === '/preview-upgrade') {
            return await this.handlePreviewUpgrade(data,authenticatedUser);
          } else if (path === '/change-subscription') {
            return await this.handleChangeSubscription(data,authenticatedUser);
          } else {
            throw new Error(`Unknown POST route: ${path}`);
          }
          
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      console.error('UpgradeController.handleRequest error:', error);
      throw error;
    }
  }

  // Embedded handlers that call business logic directly
  private static async handleGetPackages(data: any): Promise<any> {
    try {
      const { type, search, minPrice, maxPrice } = data;
      
      // Input validation
      if (minPrice && isNaN(Number(minPrice))) {
        throw new Error('Invalid minPrice parameter');
      }
      if (maxPrice && isNaN(Number(maxPrice))) {
        throw new Error('Invalid maxPrice parameter');
      }

      const packages = await UpgradeService.getPackages({
        type: type as string,
        search: search as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined
      });
      
      return {
        success: true,
        data: packages
      };
    } catch (error) {
      console.error('Error getting packages:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private static async handleGetPackageDetails(tier: string, type: string, data: any): Promise<any> {
    try {
      if (!tier || !type) {
        throw new Error('Missing required parameters');
      }

      const pkg = await UpgradeService.getPackageDetails(tier, type);
      if (!pkg) {
        throw new Error('Package not found');
      }
      
      return {
        success: true,
        data: pkg
      };
    } catch (error) {
      console.error('Error getting package details:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get package details');
    }
  }

  private static async handleGetCurrentSubscription(authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const subscription = await UpgradeService.getCurrentSubscription(userId);
      
      return {
        success: true,
        data: subscription
      };
    } catch (error) {
      console.error('Error getting current subscription:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get subscription');
    }
  }

  private static async handleCalculatePrice(data: any,authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }

      const { tier, type, billingCycle, packageId } = data;
      if (!tier || !type) {
        throw new Error('Missing required parameters');
      }

      const priceCalculation = await UpgradeService.calculatePrice(packageId, billingCycle);
      
      return {
        success: true,
        data: priceCalculation
      };
    } catch (error) {
      console.error('Error calculating price:', error);
      throw new Error(error instanceof Error ? error.message : 'Price calculation failed');
    }
  }

  private static async handleGetSubscriptionHistory(data: any,authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { page = 1, limit = 10 } = data;
      // Use model directly since service method doesn't exist
      const { SubscriptionModel } = await import('../models/Subscription');
      const history = await SubscriptionModel.getSubscriptionHistory(userId);
      
      return {
        success: true,
        data: history,
        total: history.length
      };
    } catch (error) {
      console.error('Error getting subscription history:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get subscription history');
    }
  }

  private static async handlePreviewUpgrade(data: any,authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { newTier, newType, billingCycle } = data;
      if (!newTier || !newType) {
        throw new Error('Missing required parameters');
      }

      const preview = await UpgradeService.previewUpgrade(userId, newTier, billingCycle);
      
      return {
        success: true,
        data: preview
      };
    } catch (error) {
      console.error('Error previewing upgrade:', error);
      throw new Error(error instanceof Error ? error.message : 'Upgrade preview failed');
    }
  }

  private static async handleChangeSubscription(data: any,authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      const userId = authenticatedUser ? parseInt(authenticatedUser.id) : undefined;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { newTier, newType, billingCycle, paymentMethod } = data;
      if (!newTier || !newType) {
        throw new Error('Missing required parameters');
      }

      const result = await UpgradeService.changeSubscription(userId, newTier, billingCycle);
      
      return {
        success: true,
        data: result,
        message: 'Subscription changed successfully'
      };
    } catch (error) {
      console.error('Error changing subscription:', error);
      throw new Error(error instanceof Error ? error.message : 'Subscription change failed');
    }
  }

}

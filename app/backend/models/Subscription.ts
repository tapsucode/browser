
import { db } from '../db';
import { subscriptions, packages, type Subscription, type InsertSubscription } from '../schema';
import { eq, and, gt, lt, desc } from 'drizzle-orm';
import { PackageConverter } from './Package';

export interface SubscriptionCreateInput {
  userId: number;
  packageId: number;
  period: 'monthly' | 'quarterly' | 'annual';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'cancelled' | 'expired';
  autoRenew: boolean;
}

export class SubscriptionModel {
  static async create(data: SubscriptionCreateInput): Promise<Subscription> {
    if (data.endDate <= data.startDate) {
      throw new Error('End date must be after start date');
    }
    
    const subscription = await db.insert(subscriptions).values([data]).returning();
    return subscription[0];
  }

  static async checkAndUpdateExpiredSubscriptions(): Promise<void> {
    const now = new Date();
    const expiredSubs = await db.select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, 'active'),
          lt(subscriptions.endDate, now)
        )
      );

    for (const sub of expiredSubs) {
      if (sub.autoRenew) {
        await this.renew(sub.id, sub.period);
      } else {
        await db.update(subscriptions)
          .set({ status: 'expired', updatedAt: now })
          .where(eq(subscriptions.id, sub.id));
      }
    }
  }

  static async renew(id: number, period: string): Promise<Subscription> {
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, id)
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

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

    const result = await db.update(subscriptions)
      .set({
        startDate,
        endDate,
        status: 'active',
        period,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, id))
      .returning();

    return result[0];
  }

  static async getSubscriptionHistory(userId: number): Promise<Subscription[]> {
    return await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
  }

  static async findByUserId(userId: number): Promise<Subscription[]> {
    return await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  }

  static async findActiveByUserId(userId: number): Promise<Subscription | null> {
    const result = await db.select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
          gt(subscriptions.endDate, new Date())
        )
      )
      .limit(1);
    return result[0] || null;
  }

  static async cancel(id: number): Promise<Subscription> {
    const result = await db.update(subscriptions)
      .set({ 
        status: 'cancelled',
        autoRenew: false,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return result[0];
  }

  /**
   * Lấy subscription với thông tin package
   */
  static async findWithPackage(subscriptionId: number): Promise<any | null> {
    try {
      const result = await db.select({
        subscription: subscriptions,
        package: packages,
      })
      .from(subscriptions)
      .leftJoin(packages, eq(subscriptions.packageId, packages.id))
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

      if (!result[0]) return null;

      return {
        ...result[0].subscription,
        package: result[0].package,
      };
    } catch (error) {
      console.error('Error finding subscription with package:', error);
      return null;
    }
  }

  /**
   * Lấy active subscription với package info
   */
  static async findActiveWithPackage(userId: number): Promise<any | null> {
    try {
      const result = await db.select({
        subscription: subscriptions,
        package: packages,
      })
      .from(subscriptions)
      .leftJoin(packages, eq(subscriptions.packageId, packages.id))
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
          gt(subscriptions.endDate, new Date())
        )
      )
      .limit(1);

      if (!result[0]) return null;

      return {
        ...result[0].subscription,
        package: result[0].package,
      };
    } catch (error) {
      console.error('Error finding active subscription with package:', error);
      return null;
    }
  }
}

/**
 * Converter để transform dữ liệu giữa Database format và API format
 */
export const SubscriptionConverter = {
  /**
   * Convert subscription với package info sang API format
   */
  toAPI(subscriptionWithPackage: any): any {
    try {
      const { subscription, package: pkg } = subscriptionWithPackage;
      
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

      const packageAPI = pkg ? PackageConverter.toAPI(pkg) : null;

      return {
        isSubscribed: subscription.status === 'active',
        currentPackage: packageAPI,
        expiresAt: subscription.endDate?.toISOString(),
        startedAt: subscription.startDate?.toISOString(),
        autoRenew: subscription.autoRenew || false,
        paymentMethod: subscription.paymentMethod
      };
    } catch (error) {
      console.error('Error converting subscription to API format:', error);
      throw error;
    }
  },

  /**
   * Convert từ API Request → Database format
   */
  fromAPI(apiData: any): Partial<Subscription> {
    const result: any = {};
    
    if (apiData.packageId) result.packageId = parseInt(apiData.packageId);
    if (apiData.period) result.period = apiData.period;
    if (apiData.autoRenew !== undefined) result.autoRenew = apiData.autoRenew;
    if (apiData.paymentMethod) result.paymentMethod = apiData.paymentMethod;
    
    return result;
  }
};

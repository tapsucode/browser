"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionConverter = exports.SubscriptionModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
const Package_1 = require("./Package");
class SubscriptionModel {
    static async create(data) {
        if (data.endDate <= data.startDate) {
            throw new Error('End date must be after start date');
        }
        const subscription = await db_1.db.insert(schema_1.subscriptions).values([data]).returning();
        return subscription[0];
    }
    static async checkAndUpdateExpiredSubscriptions() {
        const now = new Date();
        const expiredSubs = await db_1.db.select()
            .from(schema_1.subscriptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.subscriptions.status, 'active'), (0, drizzle_orm_1.lt)(schema_1.subscriptions.endDate, now)));
        for (const sub of expiredSubs) {
            if (sub.autoRenew) {
                await this.renew(sub.id, sub.period);
            }
            else {
                await db_1.db.update(schema_1.subscriptions)
                    .set({ status: 'expired', updatedAt: now })
                    .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.id, sub.id));
            }
        }
    }
    static async renew(id, period) {
        const subscription = await db_1.db.query.subscriptions.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.subscriptions.id, id)
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
        const result = await db_1.db.update(schema_1.subscriptions)
            .set({
            startDate,
            endDate,
            status: 'active',
            period,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.id, id))
            .returning();
        return result[0];
    }
    static async getSubscriptionHistory(userId) {
        return await db_1.db.select()
            .from(schema_1.subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.subscriptions.createdAt));
    }
    static async findByUserId(userId) {
        return await db_1.db.select().from(schema_1.subscriptions).where((0, drizzle_orm_1.eq)(schema_1.subscriptions.userId, userId));
    }
    static async findActiveByUserId(userId) {
        const result = await db_1.db.select()
            .from(schema_1.subscriptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.subscriptions.userId, userId), (0, drizzle_orm_1.eq)(schema_1.subscriptions.status, 'active'), (0, drizzle_orm_1.gt)(schema_1.subscriptions.endDate, new Date())))
            .limit(1);
        return result[0] || null;
    }
    static async cancel(id) {
        const result = await db_1.db.update(schema_1.subscriptions)
            .set({
            status: 'cancelled',
            autoRenew: false,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.id, id))
            .returning();
        return result[0];
    }
    /**
     * Lấy subscription với thông tin package
     */
    static async findWithPackage(subscriptionId) {
        try {
            const result = await db_1.db.select({
                subscription: schema_1.subscriptions,
                package: schema_1.packages,
            })
                .from(schema_1.subscriptions)
                .leftJoin(schema_1.packages, (0, drizzle_orm_1.eq)(schema_1.subscriptions.packageId, schema_1.packages.id))
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.id, subscriptionId))
                .limit(1);
            if (!result[0])
                return null;
            return {
                ...result[0].subscription,
                package: result[0].package,
            };
        }
        catch (error) {
            console.error('Error finding subscription with package:', error);
            return null;
        }
    }
    /**
     * Lấy active subscription với package info
     */
    static async findActiveWithPackage(userId) {
        try {
            const result = await db_1.db.select({
                subscription: schema_1.subscriptions,
                package: schema_1.packages,
            })
                .from(schema_1.subscriptions)
                .leftJoin(schema_1.packages, (0, drizzle_orm_1.eq)(schema_1.subscriptions.packageId, schema_1.packages.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.subscriptions.userId, userId), (0, drizzle_orm_1.eq)(schema_1.subscriptions.status, 'active'), (0, drizzle_orm_1.gt)(schema_1.subscriptions.endDate, new Date())))
                .limit(1);
            if (!result[0])
                return null;
            return {
                ...result[0].subscription,
                package: result[0].package,
            };
        }
        catch (error) {
            console.error('Error finding active subscription with package:', error);
            return null;
        }
    }
}
exports.SubscriptionModel = SubscriptionModel;
/**
 * Converter để transform dữ liệu giữa Database format và API format
 */
exports.SubscriptionConverter = {
    /**
     * Convert subscription với package info sang API format
     */
    toAPI(subscriptionWithPackage) {
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
            const packageAPI = pkg ? Package_1.PackageConverter.toAPI(pkg) : null;
            return {
                isSubscribed: subscription.status === 'active',
                currentPackage: packageAPI,
                expiresAt: subscription.endDate?.toISOString(),
                startedAt: subscription.startDate?.toISOString(),
                autoRenew: subscription.autoRenew || false,
                paymentMethod: subscription.paymentMethod
            };
        }
        catch (error) {
            console.error('Error converting subscription to API format:', error);
            throw error;
        }
    },
    /**
     * Convert từ API Request → Database format
     */
    fromAPI(apiData) {
        const result = {};
        if (apiData.packageId)
            result.packageId = parseInt(apiData.packageId);
        if (apiData.period)
            result.period = apiData.period;
        if (apiData.autoRenew !== undefined)
            result.autoRenew = apiData.autoRenew;
        if (apiData.paymentMethod)
            result.paymentMethod = apiData.paymentMethod;
        return result;
    }
};

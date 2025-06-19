"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceConverter = exports.BalanceModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class BalanceModel {
    static async getBalanceByUserId(userId) {
        try {
            const result = await db_1.db.select()
                .from(schema_1.balances)
                .where((0, drizzle_orm_1.eq)(schema_1.balances.userId, parseInt(userId)))
                .limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error getting balance:', error);
            return null;
        }
    }
    static async create(data) {
        try {
            const result = await db_1.db.insert(schema_1.balances)
                .values({
                userId: parseInt(data.userId),
                amount: data.amount,
                currency: data.currency,
                lastUpdated: new Date()
            })
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error creating balance:', error);
            throw error;
        }
    }
    static async update(id, data) {
        try {
            const result = await db_1.db.update(schema_1.balances)
                .set({
                ...data,
                lastUpdated: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.balances.id, parseInt(id)))
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error updating balance:', error);
            throw error;
        }
    }
    static async increaseBalance(userId, amount) {
        try {
            const balance = await this.getBalanceByUserId(userId);
            if (!balance)
                throw new Error('Balance not found');
            const result = await db_1.db.update(schema_1.balances)
                .set({
                amount: balance.amount + amount,
                lastUpdated: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.balances.id, balance.id))
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error increasing balance:', error);
            throw error;
        }
    }
    static async decreaseBalance(userId, amount) {
        try {
            const balance = await this.getBalanceByUserId(userId);
            if (!balance)
                throw new Error('Balance not found');
            if (balance.amount < amount)
                throw new Error('Insufficient balance');
            const result = await db_1.db.update(schema_1.balances)
                .set({
                amount: balance.amount - amount,
                lastUpdated: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.balances.id, balance.id))
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error decreasing balance:', error);
            throw error;
        }
    }
}
exports.BalanceModel = BalanceModel;
// Converter Functions
exports.BalanceConverter = {
    /**
     * Convert từ Database format → API Response format
     */
    toAPI(dbData) {
        return {
            amount: dbData.amount,
            currency: dbData.currency,
            lastUpdated: dbData.lastUpdated.toISOString()
        };
    },
    /**
     * Convert từ API Request → Database format (cho update)
     */
    fromAPI(apiData) {
        return {
            amount: apiData.amount,
            currency: apiData.currency
        };
    }
};

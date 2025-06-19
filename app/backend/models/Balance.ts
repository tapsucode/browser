
import { db } from '../db';
import { balances, type Balance } from '../schema';
import { eq } from 'drizzle-orm';

export interface BalanceCreateInput {
  userId: string;
  amount: number;
  currency: string;
}

export interface BalanceUpdateInput {
  amount?: number;
  currency?: string;
}

// API Response Types
export interface APIBalanceResponse {
  amount: number;
  currency: string;
  lastUpdated: string; // ISO date string
}

export interface APIBalanceUpdateRequest {
  amount: number;
  currency?: string;
}

export class BalanceModel {
  static async getBalanceByUserId(userId: string): Promise<Balance | null> {
    try {
      const result = await db.select()
        .from(balances)
        .where(eq(balances.userId, parseInt(userId)))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  }

  static async create(data: BalanceCreateInput): Promise<Balance> {
    try {
      const result = await db.insert(balances)
        .values({
          userId: parseInt(data.userId),
          amount: data.amount,
          currency: data.currency,
          lastUpdated: new Date()
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating balance:', error);
      throw error;
    }
  }

  static async update(id: string, data: BalanceUpdateInput): Promise<Balance> {
    try {
      const result = await db.update(balances)
        .set({
          ...data,
          lastUpdated: new Date()
        })
        .where(eq(balances.id, parseInt(id)))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }

  static async increaseBalance(userId: string, amount: number): Promise<Balance> {
    try {
      const balance = await this.getBalanceByUserId(userId);
      if (!balance) throw new Error('Balance not found');

      const result = await db.update(balances)
        .set({
          amount: balance.amount + amount,
          lastUpdated: new Date()
        })
        .where(eq(balances.id, balance.id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error increasing balance:', error);
      throw error;
    }
  }

  static async decreaseBalance(userId: string, amount: number): Promise<Balance> {
    try {
      const balance = await this.getBalanceByUserId(userId);
      if (!balance) throw new Error('Balance not found');
      if (balance.amount < amount) throw new Error('Insufficient balance');

      const result = await db.update(balances)
        .set({
          amount: balance.amount - amount,
          lastUpdated: new Date()
        })
        .where(eq(balances.id, balance.id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error decreasing balance:', error);
      throw error;
    }
  }
}

// Converter Functions
export const BalanceConverter = {
  /**
   * Convert từ Database format → API Response format
   */
  toAPI(dbData: Balance): APIBalanceResponse {
    return {
      amount: dbData.amount,
      currency: dbData.currency,
      lastUpdated: dbData.lastUpdated.toISOString()
    };
  },

  /**
   * Convert từ API Request → Database format (cho update)
   */
  fromAPI(apiData: APIBalanceUpdateRequest): BalanceUpdateInput {
    return {
      amount: apiData.amount,
      currency: apiData.currency
    };
  }
};

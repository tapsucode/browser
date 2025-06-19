import { db } from '../db';
import { transactions, users, balances, type Transaction, type InsertTransaction } from '../schema';
import { eq, desc, and } from 'drizzle-orm';

export interface TransactionCreateInput {
  userId: string;
  type: 'deposit' | 'withdrawal' | 'purchase';
  amount: number;
  currency?: string;
  paymentMethod: string;
  fee?: number;
  description?: string;
  paymentProof?: string;
}

export interface TransactionUpdateInput {
  status?: 'pending' | 'completed' | 'failed';
  paymentProof?: string;
  description?: string;
}

// API Response Types
export interface APITransactionResponse {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  date: string; // ISO date string
  paymentMethod: string;
  fee?: number;
  description?: string;
}

export interface APICreateDepositRequest {
  amount: number;
  paymentMethod: string;
  currency: string;
}

export interface APICreateDepositResponse {
  transactionId: string;
  amount: number;
  fee: number;
  total: number;
  paymentInstructions: string[];
  expiresAt: string; // ISO date string
}

export interface APIProcessPaymentRequest {
  transactionId: string;
  paymentProof?: string;
}

export interface APIProcessPaymentResponse {
  success: boolean;
  message: string;
  status: string;
  transaction: APITransactionResponse;
}

export interface APITransactionStatusResponse {
  success: boolean;
  message: string;
  status: string;
  transaction: APITransactionResponse;
}

export interface APIPaymentFees {
  bank: number;
  paypal: number;
  crypto: number;
}

export interface APIPaymentDetails {
  bank: {
    title: string;
    content: string[];
  };
  paypal: {
    title: string;
    content: string[];
  };
  crypto: {
    title: string;
    content: string[];
  };
}

export class TransactionModel {
  /**
   * Tìm transaction theo ID
   */
  static async findById(id: string): Promise<Transaction | null> {
    try {
      const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding transaction by ID:', error);
      return null;
    }
  }

  /**
   * Lấy tất cả transactions
   */
  static async findAll(limit = 50): Promise<Transaction[]> {
    try {
      return await db.select().from(transactions)
        .orderBy(desc(transactions.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error finding all transactions:', error);
      return [];
    }
  }

  /**
   * Lấy transactions theo user ID
   */
  static async findByUserId(userId: string, limit = 20): Promise<Transaction[]> {
    try {
      return await db.select().from(transactions)
        .where(eq(transactions.userId, parseInt(userId)))
        .orderBy(desc(transactions.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error finding transactions by user ID:', error);
      return [];
    }
  }

  // Alias methods để khớp với service calls
  static async getById(id: string): Promise<Transaction | null> {
    return this.findById(id);
  }

  static async getByUserId(userId: string, limit = 20): Promise<Transaction[]> {
    return this.findByUserId(userId, limit);
  }

  static async getDailyDepositTotal(userId: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const result = await db.select().from(transactions)
        .where(and(
          eq(transactions.userId, parseInt(userId)),
          eq(transactions.type, 'deposit'),
          eq(transactions.status, 'completed')
        ));
      
      return result
        .filter(t => t.createdAt >= today)
        .reduce((sum, t) => sum + t.amount, 0);
    } catch (error) {
      console.error('Error getting daily deposit total:', error);
      return 0;
    }
  }

  /**
   * Lấy transactions theo type
   */
  static async findByType(type: 'deposit' | 'withdrawal' | 'purchase', limit = 20): Promise<Transaction[]> {
    try {
      return await db.select().from(transactions)
        .where(eq(transactions.type, type))
        .orderBy(desc(transactions.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error finding transactions by type:', error);
      return [];
    }
  }

  /**
   * Tạo transaction mới
   */
  static async create(transactionData: TransactionCreateInput): Promise<Transaction | null> {
    try {
      // Generate transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newTransaction: InsertTransaction = {
        id: transactionId,
        userId: parseInt(transactionData.userId),
        type: transactionData.type,
        amount: transactionData.amount,
        currency: transactionData.currency || 'USD',
        status: 'pending',
        paymentMethod: transactionData.paymentMethod,
        fee: transactionData.fee || 0,
        description: transactionData.description || null,
        paymentProof: transactionData.paymentProof || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.insert(transactions).values(newTransaction).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  /**
   * Cập nhật transaction
   */
  static async update(id: string, transactionData: TransactionUpdateInput): Promise<Transaction | null> {
    try {
      const updateData: Partial<InsertTransaction> = {
        ...transactionData,
        updatedAt: new Date(),
      };

      const result = await db.update(transactions)
        .set(updateData)
        .where(eq(transactions.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
  }

  /**
   * Hoàn thành transaction
   */
  static async complete(id: string): Promise<boolean> {
    try {
      const transaction = await this.findById(id);
      if (!transaction) return false;

      // Cập nhật trạng thái transaction
      await db.update(transactions)
        .set({ 
          status: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, id));

      // Cập nhật balance nếu là deposit
      if (transaction.type === 'deposit') {
        await this.updateUserBalance(transaction.userId, transaction.amount);
      }

      return true;
    } catch (error) {
      console.error('Error completing transaction:', error);
      return false;
    }
  }

  /**
   * Thất bại transaction
   */
  static async fail(id: string): Promise<boolean> {
    try {
      await db.update(transactions)
        .set({ 
          status: 'failed',
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, id));

      return true;
    } catch (error) {
      console.error('Error failing transaction:', error);
      return false;
    }
  }

  /**
   * Cập nhật balance của user
   */
  private static async updateUserBalance(userId: number, amount: number): Promise<void> {
    try {
      const existingBalance = await db.select()
        .from(balances)
        .where(eq(balances.userId, userId))
        .limit(1);

      if (existingBalance.length > 0) {
        // Cập nhật balance hiện có
        const newAmount = existingBalance[0].amount + amount;
        await db.update(balances)
          .set({ 
            amount: newAmount,
            lastUpdated: new Date(),
          })
          .where(eq(balances.userId, userId));
      } else {
        // Tạo balance mới
        await db.insert(balances).values({
          userId,
          amount,
          currency: 'USD',
          lastUpdated: new Date(),
        });
      }
    } catch (error) {
      console.error('Error updating user balance:', error);
    }
  }

  /**
   * Lấy transaction với user info
   */
  static async findWithUser(id: string): Promise<(Transaction & { user?: any }) | null> {
    try {
      const result = await db.select({
        transaction: transactions,
        user: users,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(eq(transactions.id, id))
      .limit(1);

      if (!result[0]) return null;

      return {
        ...result[0].transaction,
        user: result[0].user,
      };
    } catch (error) {
      console.error('Error finding transaction with user:', error);
      return null;
    }
  }

  /**
   * Lấy pending transactions
   */
  static async findPending(limit = 20): Promise<Transaction[]> {
    try {
      return await db.select().from(transactions)
        .where(eq(transactions.status, 'pending'))
        .orderBy(desc(transactions.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error finding pending transactions:', error);
      return [];
    }
  }

  /**
   * Lấy thống kê transactions
   */
  static async getStats(userId?: number) {
    try {
      const allTransactions = userId 
        ? await db.select().from(transactions).where(eq(transactions.userId, userId))
        : await db.select().from(transactions);

      const stats = {
        total: allTransactions.length,
        completed: allTransactions.filter(t => t.status === 'completed').length,
        pending: allTransactions.filter(t => t.status === 'pending').length,
        failed: allTransactions.filter(t => t.status === 'failed').length,
        totalAmount: allTransactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0),
        byType: {
          deposit: allTransactions.filter(t => t.type === 'deposit').length,
          withdrawal: allTransactions.filter(t => t.type === 'withdrawal').length,
          purchase: allTransactions.filter(t => t.type === 'purchase').length,
        }
      };

      return stats;
    } catch (error) {
      console.error('Error getting transaction stats:', error);
      return {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        totalAmount: 0,
        byType: { deposit: 0, withdrawal: 0, purchase: 0 }
      };
    }
  }

  /**
   * Tìm kiếm transactions
   */
  static async search(query: string): Promise<Transaction[]> {
    try {
      // In a real implementation, you'd search by description, payment method, etc.
      return await db.select().from(transactions)
        .orderBy(desc(transactions.createdAt))
        .limit(20);
    } catch (error) {
      console.error('Error searching transactions:', error);
      return [];
    }
  }
}

// Converter Functions
export const TransactionConverter = {
  /**
   * Convert từ Database format → API Transaction Response
   */
  toAPI(dbData: Transaction): APITransactionResponse {
    return {
      id: dbData.id,
      type: dbData.type,
      amount: dbData.amount,
      currency: dbData.currency,
      status: dbData.status,
      date: dbData.createdAt.toISOString(),
      paymentMethod: dbData.paymentMethod,
      fee: dbData.fee || 0,
      description: dbData.description || undefined
    };
  },

  /**
   * Convert array of transactions
   */
  toAPIArray(dbData: Transaction[]): APITransactionResponse[] {
    return dbData.map(this.toAPI);
  },

  /**
   * Convert create deposit response
   */
  toCreateDepositResponse(
    transaction: Transaction, 
    fee: number, 
    instructions: string[], 
    expiresAt: Date
  ): APICreateDepositResponse {
    return {
      transactionId: transaction.id,
      amount: transaction.amount,
      fee: fee,
      total: transaction.amount + fee,
      paymentInstructions: instructions,
      expiresAt: expiresAt.toISOString()
    };
  },

  /**
   * Convert process payment response
   */
  toProcessPaymentResponse(
    success: boolean,
    message: string,
    transaction: Transaction
  ): APIProcessPaymentResponse {
    return {
      success,
      message,
      status: transaction.status,
      transaction: this.toAPI(transaction)
    };
  },

  /**
   * Convert transaction status response
   */
  toTransactionStatusResponse(
    success: boolean,
    message: string,
    transaction: Transaction
  ): APITransactionStatusResponse {
    return {
      success,
      message,
      status: transaction.status,
      transaction: this.toAPI(transaction)
    };
  }
};
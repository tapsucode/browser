"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionConverter = exports.TransactionModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class TransactionModel {
    /**
     * Tìm transaction theo ID
     */
    static async findById(id) {
        try {
            const result = await db_1.db.select().from(schema_1.transactions).where((0, drizzle_orm_1.eq)(schema_1.transactions.id, id)).limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding transaction by ID:', error);
            return null;
        }
    }
    /**
     * Lấy tất cả transactions
     */
    static async findAll(limit = 50) {
        try {
            return await db_1.db.select().from(schema_1.transactions)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.createdAt))
                .limit(limit);
        }
        catch (error) {
            console.error('Error finding all transactions:', error);
            return [];
        }
    }
    /**
     * Lấy transactions theo user ID
     */
    static async findByUserId(userId, limit = 20) {
        try {
            return await db_1.db.select().from(schema_1.transactions)
                .where((0, drizzle_orm_1.eq)(schema_1.transactions.userId, parseInt(userId)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.createdAt))
                .limit(limit);
        }
        catch (error) {
            console.error('Error finding transactions by user ID:', error);
            return [];
        }
    }
    // Alias methods để khớp với service calls
    static async getById(id) {
        return this.findById(id);
    }
    static async getByUserId(userId, limit = 20) {
        return this.findByUserId(userId, limit);
    }
    static async getDailyDepositTotal(userId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const result = await db_1.db.select().from(schema_1.transactions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.transactions.userId, parseInt(userId)), (0, drizzle_orm_1.eq)(schema_1.transactions.type, 'deposit'), (0, drizzle_orm_1.eq)(schema_1.transactions.status, 'completed')));
            return result
                .filter(t => t.createdAt >= today)
                .reduce((sum, t) => sum + t.amount, 0);
        }
        catch (error) {
            console.error('Error getting daily deposit total:', error);
            return 0;
        }
    }
    /**
     * Lấy transactions theo type
     */
    static async findByType(type, limit = 20) {
        try {
            return await db_1.db.select().from(schema_1.transactions)
                .where((0, drizzle_orm_1.eq)(schema_1.transactions.type, type))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.createdAt))
                .limit(limit);
        }
        catch (error) {
            console.error('Error finding transactions by type:', error);
            return [];
        }
    }
    /**
     * Tạo transaction mới
     */
    static async create(transactionData) {
        try {
            // Generate transaction ID
            const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newTransaction = {
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
            const result = await db_1.db.insert(schema_1.transactions).values(newTransaction).returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error creating transaction:', error);
            return null;
        }
    }
    /**
     * Cập nhật transaction
     */
    static async update(id, transactionData) {
        try {
            const updateData = {
                ...transactionData,
                updatedAt: new Date(),
            };
            const result = await db_1.db.update(schema_1.transactions)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.transactions.id, id))
                .returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error updating transaction:', error);
            return null;
        }
    }
    /**
     * Hoàn thành transaction
     */
    static async complete(id) {
        try {
            const transaction = await this.findById(id);
            if (!transaction)
                return false;
            // Cập nhật trạng thái transaction
            await db_1.db.update(schema_1.transactions)
                .set({
                status: 'completed',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.transactions.id, id));
            // Cập nhật balance nếu là deposit
            if (transaction.type === 'deposit') {
                await this.updateUserBalance(transaction.userId, transaction.amount);
            }
            return true;
        }
        catch (error) {
            console.error('Error completing transaction:', error);
            return false;
        }
    }
    /**
     * Thất bại transaction
     */
    static async fail(id) {
        try {
            await db_1.db.update(schema_1.transactions)
                .set({
                status: 'failed',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.transactions.id, id));
            return true;
        }
        catch (error) {
            console.error('Error failing transaction:', error);
            return false;
        }
    }
    /**
     * Cập nhật balance của user
     */
    static async updateUserBalance(userId, amount) {
        try {
            const existingBalance = await db_1.db.select()
                .from(schema_1.balances)
                .where((0, drizzle_orm_1.eq)(schema_1.balances.userId, userId))
                .limit(1);
            if (existingBalance.length > 0) {
                // Cập nhật balance hiện có
                const newAmount = existingBalance[0].amount + amount;
                await db_1.db.update(schema_1.balances)
                    .set({
                    amount: newAmount,
                    lastUpdated: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.balances.userId, userId));
            }
            else {
                // Tạo balance mới
                await db_1.db.insert(schema_1.balances).values({
                    userId,
                    amount,
                    currency: 'USD',
                    lastUpdated: new Date(),
                });
            }
        }
        catch (error) {
            console.error('Error updating user balance:', error);
        }
    }
    /**
     * Lấy transaction với user info
     */
    static async findWithUser(id) {
        try {
            const result = await db_1.db.select({
                transaction: schema_1.transactions,
                user: schema_1.users,
            })
                .from(schema_1.transactions)
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.transactions.userId, schema_1.users.id))
                .where((0, drizzle_orm_1.eq)(schema_1.transactions.id, id))
                .limit(1);
            if (!result[0])
                return null;
            return {
                ...result[0].transaction,
                user: result[0].user,
            };
        }
        catch (error) {
            console.error('Error finding transaction with user:', error);
            return null;
        }
    }
    /**
     * Lấy pending transactions
     */
    static async findPending(limit = 20) {
        try {
            return await db_1.db.select().from(schema_1.transactions)
                .where((0, drizzle_orm_1.eq)(schema_1.transactions.status, 'pending'))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.createdAt))
                .limit(limit);
        }
        catch (error) {
            console.error('Error finding pending transactions:', error);
            return [];
        }
    }
    /**
     * Lấy thống kê transactions
     */
    static async getStats(userId) {
        try {
            const allTransactions = userId
                ? await db_1.db.select().from(schema_1.transactions).where((0, drizzle_orm_1.eq)(schema_1.transactions.userId, userId))
                : await db_1.db.select().from(schema_1.transactions);
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
        }
        catch (error) {
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
    static async search(query) {
        try {
            // In a real implementation, you'd search by description, payment method, etc.
            return await db_1.db.select().from(schema_1.transactions)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.createdAt))
                .limit(20);
        }
        catch (error) {
            console.error('Error searching transactions:', error);
            return [];
        }
    }
}
exports.TransactionModel = TransactionModel;
// Converter Functions
exports.TransactionConverter = {
    /**
     * Convert từ Database format → API Transaction Response
     */
    toAPI(dbData) {
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
    toAPIArray(dbData) {
        return dbData.map(this.toAPI);
    },
    /**
     * Convert create deposit response
     */
    toCreateDepositResponse(transaction, fee, instructions, expiresAt) {
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
    toProcessPaymentResponse(success, message, transaction) {
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
    toTransactionStatusResponse(success, message, transaction) {
        return {
            success,
            message,
            status: transaction.status,
            transaction: this.toAPI(transaction)
        };
    }
};

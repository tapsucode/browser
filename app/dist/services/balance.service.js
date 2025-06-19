"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceService = void 0;
const Balance_1 = require("../models/Balance");
const errors_1 = require("../utils/errors");
class BalanceService {
    static async getBalance(userId) {
        const balance = await Balance_1.BalanceModel.getBalanceByUserId(userId);
        if (!balance) {
            // Create initial balance if not exists
            return await Balance_1.BalanceModel.create({
                userId,
                amount: 0,
                currency: 'USD'
            });
        }
        return balance;
    }
    static async updateBalance(userId, updateData) {
        const balance = await Balance_1.BalanceModel.getBalanceByUserId(userId);
        if (!balance) {
            throw new errors_1.AppError('Balance not found', 404);
        }
        return await Balance_1.BalanceModel.update(balance.id.toString(), updateData);
    }
    static async increaseBalance(userId, amount) {
        const balance = await Balance_1.BalanceModel.getBalanceByUserId(userId);
        if (!balance) {
            throw new errors_1.AppError('Balance not found', 404);
        }
        return await Balance_1.BalanceModel.increaseBalance(userId, amount);
    }
    static async decreaseBalance(userId, amount) {
        const balance = await Balance_1.BalanceModel.getBalanceByUserId(userId);
        if (!balance) {
            throw new errors_1.AppError('Balance not found', 404);
        }
        if (balance.amount < amount) {
            throw new errors_1.AppError('Insufficient balance', 400);
        }
        return await Balance_1.BalanceModel.decreaseBalance(userId, amount);
    }
}
exports.BalanceService = BalanceService;

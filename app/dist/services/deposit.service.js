"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositService = void 0;
const Transaction_1 = require("../models/Transaction");
const balance_service_1 = require("./balance.service");
const errors_1 = require("../utils/errors");
const env_1 = require("../config/env");
class DepositService {
    static getFees() {
        return this.fees;
    }
    static getPaymentInstructions() {
        return this.paymentInstructions;
    }
    static calculateFee(amount, paymentMethod) {
        return amount * this.fees[paymentMethod];
    }
    static async createDeposit(userId, amount, paymentMethod, currency = 'USD') {
        if (amount < this.DEPOSIT_LIMITS.min || amount > this.DEPOSIT_LIMITS.max) {
            throw new errors_1.AppError(`Deposit amount must be between ${this.DEPOSIT_LIMITS.min} and ${this.DEPOSIT_LIMITS.max}`, 400);
        }
        // Check daily limit
        const dailyTotal = await Transaction_1.TransactionModel.getDailyDepositTotal(userId);
        if (dailyTotal + amount > this.DEPOSIT_LIMITS.daily) {
            throw new errors_1.AppError(`Daily deposit limit (${this.DEPOSIT_LIMITS.daily}) exceeded`, 400);
        }
        const fee = this.calculateFee(amount, paymentMethod);
        const transaction = await Transaction_1.TransactionModel.create({
            userId,
            type: 'deposit',
            amount,
            currency,
            paymentMethod: paymentMethod.toString(),
            fee,
            description: `Deposit via ${paymentMethod}`
        });
        if (!transaction) {
            throw new errors_1.AppError('Failed to create transaction', 500);
        }
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        return Transaction_1.TransactionConverter.toCreateDepositResponse(transaction, fee, this.paymentInstructions[paymentMethod].content, expiresAt);
    }
    static async processPayment(userId, transactionId, paymentProof) {
        const transaction = await Transaction_1.TransactionModel.getById(transactionId);
        if (!transaction) {
            throw new errors_1.AppError('Transaction not found', 404);
        }
        if (transaction.userId !== parseInt(userId)) {
            throw new errors_1.AppError('Unauthorized access to transaction', 403);
        }
        if (transaction.status !== 'pending') {
            throw new errors_1.AppError('Transaction already processed', 400);
        }
        // Update transaction with proof and mark as completed
        const updatedTransaction = await Transaction_1.TransactionModel.update(transactionId, {
            status: 'completed',
            paymentProof
        });
        if (!updatedTransaction) {
            throw new errors_1.AppError('Failed to update transaction', 500);
        }
        // Add amount to user balance
        await balance_service_1.BalanceService.increaseBalance(userId, transaction.amount);
        return Transaction_1.TransactionConverter.toProcessPaymentResponse(true, 'Payment processed successfully', updatedTransaction);
    }
    static async getTransactionHistory(userId) {
        return await Transaction_1.TransactionModel.getByUserId(userId);
    }
    static async getTransactionStatus(userId, transactionId) {
        const transaction = await Transaction_1.TransactionModel.getById(transactionId);
        if (!transaction) {
            throw new errors_1.AppError('Transaction not found', 404);
        }
        if (transaction.userId !== parseInt(userId)) {
            throw new errors_1.AppError('Unauthorized access to transaction', 403);
        }
        return Transaction_1.TransactionConverter.toTransactionStatusResponse(true, `Transaction status: ${transaction.status}`, transaction);
    }
    static async uploadProof(userId, transactionId, file) {
        const transaction = await Transaction_1.TransactionModel.getById(transactionId);
        if (!transaction) {
            throw new errors_1.AppError('Transaction not found', 404);
        }
        if (transaction.userId !== parseInt(userId)) {
            throw new errors_1.AppError('Unauthorized access to transaction', 403);
        }
        // Handle file upload and update transaction with proof URL
        // This is a simplified version - you'll need to implement actual file storage
        const proofUrl = `/uploads/${file.filename}`;
        const updatedTransaction = await Transaction_1.TransactionModel.update(transactionId, {
            paymentProof: proofUrl,
            status: 'completed'
        });
        return {
            success: true,
            message: 'Payment proof uploaded successfully'
        };
    }
}
exports.DepositService = DepositService;
DepositService.fees = {
    bank: env_1.config.BANK_FEE,
    paypal: env_1.config.PAYPAL_FEE,
    crypto: env_1.config.CRYPTO_FEE
};
DepositService.paymentInstructions = {
    bank: {
        title: "Thông tin chuyển khoản ngân hàng",
        content: [
            `Ngân hàng: ${env_1.config.BANK_NAME}`,
            `Số tài khoản: ${env_1.config.BANK_ACCOUNT}`,
            `Chủ tài khoản: ${env_1.config.BANK_ACCOUNT_HOLDER}`,
            "Nội dung: NAPTHE [tên tài khoản]"
        ]
    },
    paypal: {
        title: "Thông tin thanh toán PayPal",
        content: [
            `Email PayPal: ${env_1.config.PAYPAL_EMAIL}`,
            "Ghi chú: Vui lòng ghi rõ tên tài khoản của bạn"
        ]
    },
    crypto: {
        title: "Thông tin thanh toán Crypto",
        content: [
            `Bitcoin (BTC): ${env_1.config.BTC_ADDRESS}`,
            `Ethereum (ETH): ${env_1.config.ETH_ADDRESS}`,
            `USDT (TRC20): ${env_1.config.USDT_TRC20_ADDRESS}`
        ]
    }
};
DepositService.DEPOSIT_LIMITS = {
    min: 10,
    max: 50000,
    daily: 100000
};
DepositService.PAYMENT_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

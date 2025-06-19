
import { TransactionModel, APIPaymentFees, APIPaymentDetails, APICreateDepositResponse, APIProcessPaymentResponse, APITransactionStatusResponse, TransactionConverter } from '../models/Transaction';
import { BalanceService } from './balance.service';
import { type Transaction } from '../schema';
import { AppError } from '../utils/errors';
import { config } from '../config/env';

export class DepositService {
  private static fees: APIPaymentFees = {
    bank: config.BANK_FEE,
    paypal: config.PAYPAL_FEE,
    crypto: config.CRYPTO_FEE
  };

  private static paymentInstructions: APIPaymentDetails = {
    bank: {
      title: "Thông tin chuyển khoản ngân hàng",
      content: [
        `Ngân hàng: ${config.BANK_NAME}`,
        `Số tài khoản: ${config.BANK_ACCOUNT}`,
        `Chủ tài khoản: ${config.BANK_ACCOUNT_HOLDER}`,
        "Nội dung: NAPTHE [tên tài khoản]"
      ]
    },
    paypal: {
      title: "Thông tin thanh toán PayPal",
      content: [
        `Email PayPal: ${config.PAYPAL_EMAIL}`,
        "Ghi chú: Vui lòng ghi rõ tên tài khoản của bạn"
      ]
    },
    crypto: {
      title: "Thông tin thanh toán Crypto",
      content: [
        `Bitcoin (BTC): ${config.BTC_ADDRESS}`,
        `Ethereum (ETH): ${config.ETH_ADDRESS}`,
        `USDT (TRC20): ${config.USDT_TRC20_ADDRESS}`
      ]
    }
  };

  static getFees(): APIPaymentFees {
    return this.fees;
  }

  static getPaymentInstructions(): APIPaymentDetails {
    return this.paymentInstructions;
  }

  static calculateFee(amount: number, paymentMethod: keyof APIPaymentFees): number {
    return amount * this.fees[paymentMethod];
  }

  private static DEPOSIT_LIMITS = {
    min: 10,
    max: 50000,
    daily: 100000
  };

  private static PAYMENT_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  static async createDeposit(userId: string, amount: number, paymentMethod: keyof APIPaymentFees, currency: string = 'USD'): Promise<APICreateDepositResponse> {
    if (amount < this.DEPOSIT_LIMITS.min || amount > this.DEPOSIT_LIMITS.max) {
      throw new AppError(`Deposit amount must be between ${this.DEPOSIT_LIMITS.min} and ${this.DEPOSIT_LIMITS.max}`, 400);
    }

    // Check daily limit
    const dailyTotal = await TransactionModel.getDailyDepositTotal(userId);
    if (dailyTotal + amount > this.DEPOSIT_LIMITS.daily) {
      throw new AppError(`Daily deposit limit (${this.DEPOSIT_LIMITS.daily}) exceeded`, 400);
    }

    const fee = this.calculateFee(amount, paymentMethod);
    const transaction = await TransactionModel.create({
      userId,
      type: 'deposit',
      amount,
      currency,
      paymentMethod: paymentMethod.toString(),
      fee,
      description: `Deposit via ${paymentMethod}`
    });

    if (!transaction) {
      throw new AppError('Failed to create transaction', 500);
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return TransactionConverter.toCreateDepositResponse(
      transaction,
      fee,
      this.paymentInstructions[paymentMethod].content,
      expiresAt
    );
  }

  static async processPayment(userId: string, transactionId: string, paymentProof?: string): Promise<APIProcessPaymentResponse> {
    const transaction = await TransactionModel.getById(transactionId);
    
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.userId !== parseInt(userId)) {
      throw new AppError('Unauthorized access to transaction', 403);
    }

    if (transaction.status !== 'pending') {
      throw new AppError('Transaction already processed', 400);
    }

    // Update transaction with proof and mark as completed
    const updatedTransaction = await TransactionModel.update(transactionId, {
      status: 'completed',
      paymentProof
    });

    if (!updatedTransaction) {
      throw new AppError('Failed to update transaction', 500);
    }

    // Add amount to user balance
    await BalanceService.increaseBalance(userId, transaction.amount);

    return TransactionConverter.toProcessPaymentResponse(
      true,
      'Payment processed successfully',
      updatedTransaction
    );
  }

  static async getTransactionHistory(userId: string): Promise<Transaction[]> {
    return await TransactionModel.getByUserId(userId);
  }

  static async getTransactionStatus(userId: string, transactionId: string): Promise<APITransactionStatusResponse> {
    const transaction = await TransactionModel.getById(transactionId);
    
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.userId !== parseInt(userId)) {
      throw new AppError('Unauthorized access to transaction', 403);
    }

    return TransactionConverter.toTransactionStatusResponse(
      true,
      `Transaction status: ${transaction.status}`,
      transaction
    );
  }

  static async uploadProof(userId: string, transactionId: string, file: any) {
    const transaction = await TransactionModel.getById(transactionId);
    
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.userId !== parseInt(userId)) {
      throw new AppError('Unauthorized access to transaction', 403);
    }

    // Handle file upload and update transaction with proof URL
    // This is a simplified version - you'll need to implement actual file storage
    const proofUrl = `/uploads/${file.filename}`;
    
    const updatedTransaction = await TransactionModel.update(transactionId, {
      paymentProof: proofUrl,
      status: 'completed'
    });

    return {
      success: true,
      message: 'Payment proof uploaded successfully'
    };
  }
}

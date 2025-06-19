
import { BalanceModel, BalanceUpdateInput } from '../models/Balance';
import { type Balance } from '../schema';
import { AppError } from '../utils/errors';

export class BalanceService {
  static async getBalance(userId: string): Promise<Balance> {
    const balance = await BalanceModel.getBalanceByUserId(userId);
    if (!balance) {
      // Create initial balance if not exists
      return await BalanceModel.create({
        userId,
        amount: 0,
        currency: 'USD'
      });
    }
    return balance;
  }

  static async updateBalance(userId: string, updateData: BalanceUpdateInput): Promise<Balance> {
    const balance = await BalanceModel.getBalanceByUserId(userId);
    if (!balance) {
      throw new AppError('Balance not found', 404);
    }

    return await BalanceModel.update(balance.id.toString(), updateData);
  }

  static async increaseBalance(userId: string, amount: number): Promise<Balance> {
    const balance = await BalanceModel.getBalanceByUserId(userId);
    if (!balance) {
      throw new AppError('Balance not found', 404);
    }

    return await BalanceModel.increaseBalance(userId, amount);
  }

  static async decreaseBalance(userId: string, amount: number): Promise<Balance> {
    const balance = await BalanceModel.getBalanceByUserId(userId);
    if (!balance) {
      throw new AppError('Balance not found', 404); 
    }

    if (balance.amount < amount) {
      throw new AppError('Insufficient balance', 400);
    }

    return await BalanceModel.decreaseBalance(userId, amount);
  }
}

import { Request, Response } from "express";
import { BalanceService } from "../services/balance.service";
import { BalanceConverter, APIBalanceUpdateRequest } from "../models/Balance";
import { AppError } from "../utils/errors";
// Thêm import này để có type checking tốt hơn
import { type AuthenticatedUser } from '../middleware/auth.middleware';

export class BalanceController {
  /**
   * Handle requests from main.js routing for /api/balance/*
   * Parse method and URL to call appropriate method
   */
  static async handleRequest(method: string, url: string, data: any, headers: any = {}, authenticatedUser: AuthenticatedUser | null = null): Promise<any> {
    try {
      // Parse URL path: /api/balance -> /
      const urlParts = url.split('/').filter(part => part !== '');
      const path = '/' + urlParts.slice(2).join('/'); // Remove 'api', 'balance'
      
      switch (method) {
        case 'GET':
          if (path === '/') {
            // SỬA ĐỔI: Truyền `authenticatedUser` xuống hàm con
            return await this.handleGetBalance(authenticatedUser);
          } else {
            throw new Error(`Unknown GET route: ${path}`);
          }
          
        case 'PUT':
          if (path === '/') {
            // SỬA ĐỔI: Truyền `authenticatedUser` và `data` xuống hàm con
            return await this.handleUpdateBalance(data, authenticatedUser);
          } else {
            throw new Error(`Unknown PUT route: ${path}`);
          }
          
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      console.error('BalanceController.handleRequest error:', error);
      throw error;
    }
  }

  // Embedded handlers that call business logic directly
  private static async handleGetBalance(authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      // SỬA ĐỔI: Kiểm tra trực tiếp `authenticatedUser`
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }

      // SỬA ĐỔI: Sử dụng `authenticatedUser.id`
      const balance = await BalanceService.getBalance(authenticatedUser.id.toString());
      const apiResponse = BalanceConverter.toAPI(balance);
      
      return {
        success: true,
        data: apiResponse
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private static async handleUpdateBalance(data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      // SỬA ĐỔI: Kiểm tra trực tiếp `authenticatedUser`
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      
      // SỬA ĐỔI: Lấy userId từ `authenticatedUser`
      const userId = authenticatedUser.id;

      const { amount, currency } = data as APIBalanceUpdateRequest;
      if (typeof amount !== "number") {
        throw new Error('Invalid amount');
      }

      const updateData = BalanceConverter.fromAPI({ amount, currency });
      const balance = await BalanceService.updateBalance(userId.toString(), updateData);
      const apiResponse = BalanceConverter.toAPI(balance);
      
      return {
        success: true,
        data: apiResponse,
        message: 'Balance updated successfully'
      };
    } catch (error) {
      console.error('Error updating balance:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

}
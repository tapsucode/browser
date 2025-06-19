
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { DepositService } from '../services/deposit.service';
import { TransactionConverter, APICreateDepositRequest, APIProcessPaymentRequest, APIPaymentFees } from '../models/Transaction';
import { AppError } from '../utils/errors';
import { type User } from '../schema';
import { config } from '../config/env';
import { AuthMiddleware, type AuthenticatedUser } from '../middleware/auth.middleware';


// Cấu hình multer để lưu file vào thư mục images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = config.UPLOAD_DIR.startsWith('./') ? 
      path.join(process.cwd(), config.UPLOAD_DIR.slice(2)) : 
      config.UPLOAD_DIR;
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique với timestamp và random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `payment-proof-${uniqueSuffix}${fileExtension}`);
  }
});

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    // Chỉ cho phép file ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      // Khắc phục lỗi TypeScript: sử dụng null thay vì Error object
      cb(null, false);
    }
  }
});

export class DepositController {
  /**
   * Handle requests from main.js routing for /api/deposit/*
   * Parse method and URL to call appropriate method
   */
  static async handleRequest(method: string, url: string, data: any, headers: any = {}, authenticatedUser: AuthenticatedUser | null = null): Promise<any> {
    try {
      const urlParts = url.split('/').filter(part => part !== '');
      const path = '/' + urlParts.slice(2).join('/');
      
      switch (method) {
        case 'GET':
          if (path === '/fees') {
            return await this.handleGetFees(); // Không cần data hay user
          } else if (path === '/payment-details') {
            // SỬA ĐỔI: Truyền `authenticatedUser`
            return await this.handleGetPaymentDetails(authenticatedUser);
          } else if (path === '/transactions') {
            // SỬA ĐỔI: Truyền `data` (cho filter) và `authenticatedUser`
            return await this.handleGetTransactionHistory(data, authenticatedUser);
          } else if (path.match(/^\/transaction\/\w+$/)) {
            const transactionId = path.split('/')[2];
            // SỬA ĐỔI: Truyền `authenticatedUser`
            return await this.handleCheckTransactionStatus(transactionId, authenticatedUser);
          } else {
            throw new Error(`Unknown GET route: ${path}`);
          }
          
        case 'POST':
          if (path === '/create') {
            // SỬA ĐỔI: Truyền `data` và `authenticatedUser`
            return await this.handleCreateDeposit(data, authenticatedUser);
          } else if (path === '/process') {
            // SỬA ĐỔI: Truyền `data` và `authenticatedUser`
            return await this.handleProcessPayment(data, authenticatedUser);
          } else if (path === '/upload-proof') {
            // SỬA ĐỔI: Truyền `data` và `authenticatedUser`
            return await this.handleUploadPaymentProof(data, authenticatedUser);
          } else {
            throw new Error(`Unknown POST route: ${path}`);
          }
          
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      console.error('DepositController.handleRequest error:', error);
      throw error;
    }
  }

  // Embedded handlers that call business logic directly
  private static async handleGetFees(): Promise<any> { // SỬA ĐỔI: Bỏ tham số `data` không dùng đến
    try {
      const fees = DepositService.getFees();
      return {
        success: true,
        data: fees
      };
    } catch (error) {
      console.error('Error getting fees:', error);
      throw new Error('Internal server error');
    }
  }

  private static async handleGetPaymentDetails(authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }

      // Temporarily return basic payment details structure
      const paymentDetails = {
        bankDetails: {
          name: 'Vietcombank',
          account: '1234567890',
          holder: 'ANTI DETECT COMPANY'
        },
        cryptoAddresses: {
          btc: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
          eth: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7'
        }
      };
      return {
        success: true,
        data: paymentDetails
      };
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private static async handleCreateDeposit(data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = authenticatedUser.id;

      const { amount, currency, paymentMethod } = data;
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }

      if (!paymentMethod) {
        throw new Error('Payment method is required');
      }

      const transaction = await DepositService.createDeposit(userId, amount, currency || 'USD', paymentMethod);
      
      return {
        success: true,
        data: transaction,
        message: 'Deposit created successfully'
      };
    } catch (error) {
      console.error('Error creating deposit:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create deposit');
    }
  }

  private static async handleProcessPayment(data: any,authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = authenticatedUser.id;

      const { transactionId, paymentDetails } = data;
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      const result = await DepositService.processPayment(transactionId, userId, paymentDetails);
      
      return {
        success: true,
        data: result,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error(error instanceof Error ? error.message : 'Payment processing failed');
    }
  }

  private static async handleGetTransactionHistory(data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = authenticatedUser.id;

      const { page = 1, limit = 10, status, type } = data || {};
      const transactions = await DepositService.getTransactionHistory(userId);
      
      const apiTransactions = transactions;
      
      return {
        success: true,
        data: apiTransactions,
        total: apiTransactions.length
      };
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch transaction history');
    }
  }

  private static async handleCheckTransactionStatus(transactionId: string, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {

      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = authenticatedUser.id;

      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      const transaction = await DepositService.getTransactionStatus(transactionId, userId);
      
      return {
        success: true,
        data: transaction
      };
    } catch (error) {
      console.error('Error checking transaction status:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to check transaction status');
    }
  }

  private static async handleUploadPaymentProof(data: any,authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = authenticatedUser.id;

      const { transactionId, file } = data;
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      if (!file) {
        throw new Error('Payment proof file is required');
      }

      // Temporarily implement basic file upload logic
      const result = {
        success: true,
        message: 'Payment proof uploaded successfully',
        filename: file.filename
      };
      
      return {
        success: true,
        data: result,
        message: 'Payment proof uploaded successfully'
      };
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload payment proof');
    }
  }

}

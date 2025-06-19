import { ElectronAPIClient } from "../electron-api";
import { handleArrayResponse } from '../../utils/error-utils';

/**
 * Service xử lý các chức năng liên quan đến nạp tiền
 * Được sử dụng trong các pages:
 * - DepositPage
 * - Các component liên quan đến thanh toán
 */

// Các interface cho dữ liệu giao dịch
export interface Balance {
  amount: number;
  currency: string;
  lastUpdated: string;
}
export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'purchase';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  paymentMethod: string;
  fee?: number;
  description?: string;
}

export interface DepositRequest {
  amount: number;
  paymentMethod: 'bank' | 'paypal' | 'crypto';
  currency: string;
}

export interface DepositResponse {
  transactionId: string;
  amount: number;
  fee: number;
  total: number;
  paymentInstructions: string[];
  expiresAt: string;
}

export interface ProcessPaymentRequest {
  transactionId: string;
  paymentProof?: string; // URL hoặc base64 của ảnh biên lai
}

export interface ProcessPaymentResponse {
  success: boolean;
  message: string;
  status: 'pending' | 'completed' | 'failed';
  transaction?: Transaction;
}

export interface PaymentDetails {
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

export interface FeeStructure {
  bank: number;
  paypal: number;
  crypto: number;
}

export const DepositFunctionalService = {
  /**
   * Lấy thông tin số dư tài khoản của người dùng
   * @returns Promise<Balance> Thông tin số dư tài khoản
   */
  async getAccountBalance(): Promise<Balance> {
    try {
      const response = await ElectronAPIClient.request("GET", "/api");
      const data = await response.json();
      
      // Kiểm tra cấu trúc dữ liệu
      if (data && data.data && data.data.amount !== undefined) {
        return data.data;
      } else if (data && data.amount !== undefined) {
        return data;
      }
      
      // Trả về giá trị mặc định nếu không có dữ liệu hợp lệ
      console.warn('Dữ liệu balance không đúng định dạng:', data);
      return { amount: 0, currency: 'USD', lastUpdated: new Date().toISOString() };
    } catch (error) {
      console.error('Lỗi khi lấy thông tin số dư:', error);
      return { amount: 0, currency: 'USD', lastUpdated: new Date().toISOString() };
    }
  },
  
  /**
   * Lấy lịch sử giao dịch của người dùng
   * @returns Promise<Transaction[]> Danh sách giao dịch
   */
  async getTransactionHistory(): Promise<Transaction[]> {
    return handleArrayResponse<Transaction>(
      ElectronAPIClient.request("GET", "/api/deposit/transactions"),
      'DepositFunctionalService', // Tên service để log lỗi
      'getTransactionHistory'     // Tên phương thức để log lỗi
    );
  },

  /**
   * Tạo một giao dịch nạp tiền mới
   * @param depositData Dữ liệu nạp tiền
   * @returns Promise<DepositResponse> Thông tin giao dịch
   */
  async createDeposit(depositData: DepositRequest): Promise<DepositResponse> {
    const response = await ElectronAPIClient.request("POST", "/api/deposit/create", depositData);
    return response.json();
  },

  /**
   * Xử lý và xác nhận một giao dịch thanh toán
   * @param data Dữ liệu thanh toán
   * @returns Promise<ProcessPaymentResponse> Kết quả xử lý
   */
  async processPayment(data: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    const response = await ElectronAPIClient.request("POST", "/api/deposit/process", data);
    return response.json();
  },

  /**
   * Lấy cấu trúc phí thanh toán
   * @returns Promise<FeeStructure> Cấu trúc phí
   */
  async getPaymentFees(): Promise<FeeStructure> {
    const response = await ElectronAPIClient.request("GET", "/api/deposit/fees");
    return response.json();
  },

  /**
   * Lấy chi tiết/hướng dẫn thanh toán
   * @returns Promise<PaymentDetails> Chi tiết thanh toán
   */
  async getPaymentDetails(): Promise<PaymentDetails> {
    const response = await ElectronAPIClient.request("GET", "/api/deposit/details");
    return response.json();
  },

  /**
   * Kiểm tra trạng thái của một giao dịch đã tồn tại
   * @param transactionId ID giao dịch
   * @returns Promise<ProcessPaymentResponse> Trạng thái giao dịch
   */
  async checkTransactionStatus(transactionId: string): Promise<ProcessPaymentResponse> {
    const response = await ElectronAPIClient.request("GET", `/api/deposit/status/${transactionId}`);
    return response.json();
  },

  /**
   * Tải lên bằng chứng thanh toán
   * @param transactionId ID giao dịch
   * @param file File ảnh biên lai
   * @returns Promise<{success: boolean, message: string}> Kết quả tải lên
   */
  async uploadPaymentProof(transactionId: string, file: File): Promise<{success: boolean, message: string}> {
    const formData = new FormData();
    formData.append('proof', file);
    formData.append('transactionId', transactionId);
    
    // Sử dụng ElectronAPIClient để đảm bảo tính nhất quán
    const response = await ElectronAPIClient.request('POST', '/api/deposit/upload-proof', formData);
    
    return response.json();
  },

  /**
   * Tính toán phí giao dịch
   * @param amount Số tiền giao dịch
   * @param paymentMethod Phương thức thanh toán
   * @returns {fee: number, total: number} Phí và tổng số tiền
   */
  calculateFee(amount: number, paymentMethod: 'bank' | 'paypal' | 'crypto'): {fee: number, total: number} {
    const feeRates = {
      bank: 0.02, // 2% cho chuyển khoản ngân hàng
      paypal: 0.035, // 3.5% cho Paypal
      crypto: 0.01, // 1% cho crypto
    };
    
    const fee = amount * feeRates[paymentMethod];
    const total = amount + fee;
    
    return {
      fee: parseFloat(fee.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  },

  /**
   * Lấy các mệnh giá cố định cho nạp tiền
   * @returns Danh sách mệnh giá
   */
  getPresetAmounts(): {value: number, label: string}[] {
    return [
      { value: 10, label: "$10" },
      { value: 20, label: "$20" },
      { value: 50, label: "$50" },
      { value: 100, label: "$100" },
      { value: 200, label: "$200" },
      { value: 500, label: "$500" },
    ];
  },

  /**
   * Lấy hướng dẫn thanh toán theo phương thức
   * @param method Phương thức thanh toán
   * @returns Hướng dẫn thanh toán
   */
  getPaymentInstructions(method: 'bank' | 'paypal' | 'crypto'): {title: string, content: string[]} {
    const instructions = {
      bank: {
        title: "Thông tin chuyển khoản ngân hàng",
        content: [
          "Ngân hàng: Vietcombank",
          "Số tài khoản: 1234567890",
          "Chủ tài khoản: CÔNG TY TNHH ANTI DETECT",
          "Nội dung: NAPTHE [tên tài khoản]"
        ]
      },
      paypal: {
        title: "Thông tin thanh toán PayPal",
        content: [
          "Email PayPal: payments@antidetect.com",
          "Ghi chú: Vui lòng ghi rõ tên tài khoản của bạn"
        ]
      },
      crypto: {
        title: "Thông tin thanh toán Crypto",
        content: [
          "Bitcoin (BTC): 3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
          "Ethereum (ETH): 0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
          "USDT (TRC20): TD3yJnw9D7pq3GKjcESzaePxPV1hTGpXXi"
        ]
      }
    };
    
    return instructions[method];
  }
};
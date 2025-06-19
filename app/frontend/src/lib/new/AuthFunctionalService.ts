import { ElectronAPIClient } from "../electron-api";
import { TokenManager } from "../token-manager";

// Định nghĩa kiểu User cho service
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service xử lý các chức năng liên quan đến xác thực người dùng
 * Được sử dụng trong các pages:
 * - AuthPage (login, register)
 * - Các component header/navbar (hiển thị thông tin user, logout)
 * - Và các trang khác cần kiểm tra trạng thái đăng nhập
 */
export const AuthFunctionalService = {
  /**
   * Thực hiện đăng nhập người dùng
   * @param credentials Thông tin đăng nhập (username, password)
   * @returns Promise<User> Thông tin người dùng sau khi đăng nhập thành công
   */
  async login(credentials: { username: string; password: string }): Promise<User> {
    const response = await ElectronAPIClient.request("POST", "/api/auth/login", credentials);
    const data = await response.json();
    
    // Lưu token và user info vào localStorage
    if (data.token && data.user) {
      TokenManager.saveAuth(data.token, data.user);
      return data.user;
    }
    
    return data;
  },

  /**
   * Đăng ký người dùng mới
   * @param userData Thông tin đăng ký người dùng
   * @returns Promise<User> Thông tin người dùng sau khi đăng ký thành công
   */
  async register(userData: any): Promise<User> {
    const response = await ElectronAPIClient.request("POST", "/api/auth/register", userData);
    const data = await response.json();
    
    // Lưu token và user info vào localStorage
    if (data.token && data.user) {
      TokenManager.saveAuth(data.token, data.user);
      return data.user;
    }
    
    return data;
  },

  /**
   * Đăng xuất người dùng hiện tại
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    await ElectronAPIClient.request("POST", "/api/auth/logout");
    // Xóa token và user info khỏi localStorage
    TokenManager.clearAuth();
  },

  /**
   * Yêu cầu khôi phục mật khẩu
   * @param username Tên đăng nhập hoặc email cần khôi phục mật khẩu
   * @returns Promise<{ success: boolean; message: string }>
   */
  async forgotPassword(username: string): Promise<{ success: boolean; message: string }> {
    const response = await ElectronAPIClient.request("POST", "/api/auth/forgot-password", { username });
    return await response.json();
  },

  /**
   * Đặt lại mật khẩu với token
   * @param resetData Dữ liệu đặt lại mật khẩu
   * @returns Promise<{ success: boolean; message: string }>
   */
  async resetPassword(resetData: { token: string; password: string; confirmPassword: string }): Promise<{ success: boolean; message: string }> {
    const response = await ElectronAPIClient.request("POST", "/api/auth/reset-password", resetData);
    return await response.json();
  },

  /**
   * Lấy thông tin người dùng hiện tại
   * @returns Promise<User | null> Thông tin người dùng hoặc null nếu chưa đăng nhập
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Kiểm tra token có tồn tại và chưa hết hạn
      if (!TokenManager.hasToken() || TokenManager.isTokenExpired()) {
        TokenManager.clearAuth();
        return null;
      }

      const response = await ElectronAPIClient.request("GET", "/api/auth/user");
      const user = await response.json();
      
      // Cập nhật user info trong localStorage
      if (user) {
        const token = TokenManager.getToken();
        if (token) {
          TokenManager.saveAuth(token, user);
        }
      }
      
      return user;
    } catch (error) {
      // Nếu lỗi 401, xóa token và redirect
      if (error instanceof Error && error.message.includes("401")) {
        TokenManager.clearAuth();
        return null;
      }
      throw error;
    }
  },

  /**
   * Cập nhật thông tin người dùng
   * @param userData Thông tin người dùng cần cập nhật
   * @returns Promise<User> Thông tin người dùng sau khi cập nhật
   */
  async updateUser(userData: Partial<User>): Promise<User> {
    const response = await ElectronAPIClient.request("PATCH", "/api/auth/user", userData);
    return await response.json();
  },

  /**
   * Xác thực token
   * @param token Token cần xác thực
   * @returns Promise<{ valid: boolean, user?: User }>
   */
  async verifyToken(token: string): Promise<{ valid: boolean, user?: User }> {
    try {
      const response = await ElectronAPIClient.request("POST", "/api/auth/verify-token", { token });
      const data = await response.json();
      return { valid: true, user: data };
    } catch (error) {
      return { valid: false };
    }
  },

  /**
   * Kiểm tra quyền của người dùng
   * @param role Quyền cần kiểm tra
   * @param user Thông tin người dùng
   * @returns boolean Có quyền hay không
   */
  hasRole(role: string, user?: User | null): boolean {
    if (!user) return false;
    
    // Kiểm tra quyền admin
    if (role === "admin" && user.role === "admin") {
      return true;
    }
    
    // Kiểm tra quyền user
    if (role === "user" && (user.role === "user" || user.role === "admin")) {
      return true;
    }
    
    return false;
  },

  /**
   * Lấy chữ cái đầu của tên người dùng
   * @param user Thông tin người dùng
   * @returns string Ký tự đầu của tên và họ
   */
  getInitials(user?: User | null): string {
    if (!user?.firstName && !user?.lastName) return '';
    
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    
    return `${first}${last}`.toUpperCase();
  },

  /**
   * Khôi phục session từ localStorage
   * @returns User | null User info nếu có session hợp lệ
   */
  restoreSession(): User | null {
    try {
      if (!TokenManager.hasToken() || TokenManager.isTokenExpired()) {
        TokenManager.clearAuth();
        return null;
      }
      
      return TokenManager.getUser();
    } catch (error) {
      console.error('Failed to restore session:', error);
      TokenManager.clearAuth();
      return null;
    }
  },

  /**
   * Kiểm tra xem có session hợp lệ không
   * @returns boolean
   */
  hasValidSession(): boolean {
    return TokenManager.hasToken() && !TokenManager.isTokenExpired();
  }
};
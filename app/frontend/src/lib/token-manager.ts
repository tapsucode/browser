/**
 * Token Manager - Quản lý JWT token trong localStorage
 */
export class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';

  /**
   * Lưu token và user info vào localStorage
   */
  static saveAuth(token: string, user: any): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  }

  /**
   * Lấy token từ localStorage
   */
  static getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  /**
   * Lấy user info từ localStorage
   */
  static getUser(): any | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  /**
   * Xóa token và user info khỏi localStorage
   */
  static clearAuth(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Kiểm tra xem token có tồn tại không
   */
  static hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Kiểm tra token có hết hạn không (simple check)
   */
  static isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decode JWT token để kiểm tra expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return true;
    }
  }

  /**
   * Tự động refresh token nếu sắp hết hạn
   */
  static shouldRefreshToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeToExpiry = payload.exp - currentTime;
      
      // Refresh nếu còn dưới 5 phút
      return timeToExpiry < 300;
    } catch (error) {
      return false;
    }
  }
}
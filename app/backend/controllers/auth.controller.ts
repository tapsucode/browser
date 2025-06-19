import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserModel, UserConverter, type APIRegisterRequest, type APIUserRequest } from '../models/User';
import { createToken } from '../utils/jwt';
import { AuthError, AppError } from '../utils/errors';
import { AuthMiddleware, type AuthenticatedUser } from '../middleware/auth.middleware';

export class AuthController {
  /**
   * Handle requests from main.js routing
   * Parse method and URL to call appropriate method
   */
  static async handleRequest(method: string, url: string, data: any, headers: any = {}, authenticatedUser: AuthenticatedUser | null = null): Promise<any> {
    try {
      // Parse URL path: /api/auth/login -> /login
      const urlParts = url.split('/').filter(part => part !== '');
      const path = '/' + urlParts.slice(2).join('/'); // Remove 'api' and 'auth'
      
      switch (method) {
        case 'POST':
          if (path === '/login') {
            return await this.handleLogin(data);
          } else if (path === '/register') {
            return await this.handleRegister(data);
          } else if (path === '/logout') {
            return await this.handleLogout(data);
          } else if (path === '/forgot-password') {
            return await this.handleForgotPassword(data);
          } else if (path === '/reset-password') {
            return await this.handleResetPassword(data);
          } else if (path === '/verify-token') {
            return await this.handleVerifyToken(data);
          } else {
            throw new Error(`Unknown POST route: ${path}`);
          }
          
        case 'GET':
          if (path === '/me' || path === '/user') {
            return await this.handleGetCurrentUser(authenticatedUser, headers);
          } else {
            throw new Error(`Unknown GET route: ${path}`);
          }
          
        case 'PATCH':
          if (path === '/user') {
            return await this.handleUpdateUser(data, authenticatedUser);
          } else {
            throw new Error(`Unknown PATCH route: ${path}`);
          }
          
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      console.error('AuthController.handleRequest error:', error);
      throw error;
    }
  }

  // Embedded handlers that call business logic directly
  private static async handleLogin(data: any): Promise<any> {
    try {
      const { username, password } = data;
      const result = await AuthService.login(username, password);
      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw new Error(error.message);
      }
      if (error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw new Error('Internal server error');
    }
  }

  private static async handleRegister(data: any): Promise<any> {
    try {
      const apiData: APIRegisterRequest = data;

      if (!apiData.username || !apiData.password) {
        throw new Error('Username and password are required');
      }

      // Check existing user
      const existingUser = await UserModel.findByUsername(apiData.username);
      if (existingUser) {
        throw new AuthError('Username already exists');
      }

      // Convert API data to database format
      const dbData = UserConverter.fromRegisterAPI(apiData);
      const user = await UserModel.create(dbData);

      if (!user) {
        throw new Error('Failed to create user');
      }

      const token = createToken(user);

      return {
        user: UserConverter.toAPI(user),
        token
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw new Error('Internal server error');
    }
  }

  private static async handleLogout(data: any): Promise<any> {
    try {
      if (!data?.user?.id) {
        throw new Error('User not authenticated');
      }
      await AuthService.logout(data.user.id);
      return { success: true };
    } catch (error) {
      if (error instanceof AppError || error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw new Error('Internal server error');
    }
  }

  private static async handleForgotPassword(data: any): Promise<any> {
    try {
      const { username } = data;
      const result = await AuthService.forgotPassword(username);
      return result;
    } catch (error) {
      if (error instanceof AppError || error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw new Error('Internal server error');
    }
  }

  private static async handleResetPassword(data: any): Promise<any> {
    try {
      const { token, password } = data;
      const result = await AuthService.resetPassword(token, password);
      return result;
    } catch (error) {
      if (error instanceof AppError || error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw new Error('Internal server error');
    }
  }

  private static async handleVerifyToken(data: any): Promise<any> {
    try {
      const { token } = data;
      const result = await AuthService.verifyToken(token);
      return result;
    } catch (error) {
      if (error instanceof AppError || error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw new Error('Internal server error');
    }
  }

  private static async handleGetCurrentUser(authenticatedUser: AuthenticatedUser | null, headers: any): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new AuthError('Authentication required');
      }
      
      const user = await UserModel.findWithBalance(parseInt(authenticatedUser.id));
      if (!user) {
        throw new AuthError('User not found');
      }

      // Convert to API format và thêm balance info
      const apiUser = UserConverter.toAPI(user);
      return {
        ...apiUser,
        balance: user.balance
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw new Error('Internal server error');
    }
  }

  private static async handleUpdateUser(data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new AuthError('Authentication required');
      }
      
      const result = await AuthService.updateUser(parseInt(authenticatedUser.id), data);
      return result;
    } catch (error) {
      if (error instanceof AppError || error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw new Error('Internal server error');
    }
  }

  static async login(data: any): Promise<any> {
    return await this.handleLogin(data);
  }

  static async logout(data: any): Promise<any> {
    return await this.handleLogout(data);
  }

  static async forgotPassword(data: any): Promise<any> {
    return await this.handleForgotPassword(data);
  }

  static async resetPassword(data: any): Promise<any> {
    return await this.handleResetPassword(data);
  }

  static async verifyToken(data: any): Promise<any> {
    return await this.handleVerifyToken(data);
  }

  static async updateUser(data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    return await this.handleUpdateUser(data, authenticatedUser);
  }

  static async register(data: any): Promise<any> {
    return await this.handleRegister(data);
  }

  static async getCurrentUser(authenticatedUser: AuthenticatedUser | null, headers: any): Promise<any> {
    return await this.handleGetCurrentUser(authenticatedUser, headers);
  }
}
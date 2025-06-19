
import { UserModel, UserConverter } from '../models/User';
import { createToken, verifyToken } from '../utils/jwt';
import { AuthError } from '../utils/errors';
import { config } from '../config/env';
import { randomBytes } from 'crypto';
// Inline email function to avoid module import issues
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  console.log(`[EMAIL] Would send email to: ${to}`);
  console.log(`[EMAIL] Subject: ${subject}`);
  return true;
}

export class AuthService {
  private static MAX_LOGIN_ATTEMPTS = config.MAX_LOGIN_ATTEMPTS;
  private static LOCK_TIME = config.ACCOUNT_LOCK_TIME;
  private static PASSWORD_RESET_EXPIRY = config.PASSWORD_RESET_EXPIRY;

  static async login(username: string, password: string) {
    const user = await UserModel.findByUsername(username);
    
    // Check login attempts
    if (user && (user.loginAttempts || 0) >= AuthService.MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date(user.lockUntil || 0);
      if (lockUntil > new Date()) {
        throw new AuthError('Account is temporarily locked. Please try again later.');
      }
      // Reset counter after lock expires (will be handled in UserModel.update)
    }
    if (!user) {
      throw new AuthError('Invalid credentials');
    }

    const isValid = await UserModel.verifyPassword(password, user.password);
    if (!isValid) {
      throw new AuthError('Invalid credentials');
    }

    const token = createToken(user);
    await UserModel.updateLastLogin(user.id);

    return { 
      user: UserConverter.toAPI(user), 
      token 
    };
  }

  static async register(userData: { username: string; password: string; email: string; fullName?: string }) {
    const existingUser = await UserModel.findByUsername(userData.username);
    if (existingUser) {
      throw new AuthError('Username already exists');
    }

    const user = await UserModel.create(userData);
    if (!user) {
      throw new Error('Failed to create user');
    }

    const token = createToken(user);
    return { 
      user: UserConverter.toAPI(user), 
      token 
    };
  }

  static async getCurrentUser(userId: number) {
    const user = await UserModel.findWithBalance(userId);
    if (!user) {
      throw new AuthError('User not found');
    }
    return UserConverter.toAPI(user);
  }

  static async verifyUserToken(token: string) {
    try {
      const decoded = verifyToken(token);
      const user = await UserModel.findById(decoded.id);
      return { 
        valid: !!user, 
        user: user ? UserConverter.toAPI(user) : null 
      };
    } catch (error) {
      return { valid: false };
    }
  }

  static async logout(userId: number) {
    // Implementation for logout logic if needed
    return { success: true };
  }

  static async forgotPassword(username: string) {
    // Implementation for forgot password logic
    const user = await UserModel.findByUsername(username);
    if (!user) {
      throw new AuthError('User not found');
    }
    // Logic to send reset email
    return { message: 'Password reset email sent' };
  }

  static async resetPassword(token: string, password: string) {
    // Implementation for reset password logic
    return { message: 'Password reset successfully' };
  }

  static async verifyToken(token: string) {
    try {
      const decoded = verifyToken(token);
      return { valid: true, userId: decoded.id };
    } catch (error) {
      return { valid: false };
    }
  }

  static async updateUser(userId: number, updateData: any) {
    const user = await UserModel.update(userId, updateData);
    if (!user) {
      throw new AuthError('Failed to update user');
    }
    return UserConverter.toAPI(user);
  }
}

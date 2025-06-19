import { db } from '../db';
import { users, balances, type User, type InsertUser } from '../schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export interface UserCreateInput {
  username: string;
  password: string;
  email: string;
  fullName?: string;
  role?: string;
}

export interface UserUpdateInput {
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'suspended';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export class UserModel {
  /**
   * Tìm user theo ID
   */
  static async findById(id: number): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  /**
   * Tìm user theo username
   */
  static async findByUsername(username: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      return null;
    }
  }

  /**
   * Tìm user theo email
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Tạo user mới
   */
  static async create(userData: UserCreateInput): Promise<User | null> {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const newUser: InsertUser = {
        username: userData.username,
        password: hashedPassword,
        email: userData.email,
        fullName: userData.fullName || null,
        role: userData.role || 'user',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.insert(users).values(newUser).returning();
      
      // Tạo balance ban đầu cho user
      if (result[0]) {
        await db.insert(balances).values({
          userId: result[0].id,
          amount: 0,
          currency: 'USD',
          lastUpdated: new Date(),
        });
      }
      
      return result[0] || null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  /**
   * Cập nhật user
   */
  static async update(id: number, userData: UserUpdateInput): Promise<User | null> {
    try {
      const updateData: Partial<InsertUser> = {
        ...userData,
        updatedAt: new Date(),
      };

      // Hash password nếu có
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(userData.password, salt);
      }

      const result = await db.update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  /**
   * Xóa user
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Update last login
   */
  static async updateLastLogin(id: number): Promise<void> {
    try {
      await db.update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, id));
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Get user với balance
   */
  static async findWithBalance(id: number): Promise<(User & { balance?: { amount: number; currency: string } }) | null> {
    try {
      const result = await db.select({
        user: users,
        balance: balances,
      })
      .from(users)
      .leftJoin(balances, eq(users.id, balances.userId))
      .where(eq(users.id, id))
      .limit(1);

      if (!result[0]) return null;

      return {
        ...result[0].user,
        balance: result[0].balance ? {
          amount: result[0].balance.amount,
          currency: result[0].balance.currency,
        } : undefined,
      };
    } catch (error) {
      console.error('Error finding user with balance:', error);
      return null;
    }
  }
}

// ===== CONVERSION LAYER =====

/**
 * Interface cho API Request từ frontend
 */
export interface APIUserRequest {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

/**
 * Interface cho API Response gửi về frontend
 */
export interface APIUserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface cho API Register Request
 */
export interface APIRegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Converter để đồng bộ dữ liệu giữa Database và API
 */
export const UserConverter = {
  /**
   * Convert từ Database User → API Response format
   */
  toAPI(dbUser: User): APIUserResponse {
    // Tách fullName thành firstName và lastName
    const nameParts = dbUser.fullName?.split(' ') || [];
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(' ') || null;

    return {
      id: dbUser.id.toString(), // integer → string
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
      avatar: null, // Schema chưa có field avatar, tạm để null
      firstName: firstName,
      lastName: lastName,
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString()
    };
  },

  /**
   * Convert từ API Register Request → Database Insert format
   */
  fromRegisterAPI(apiData: APIRegisterRequest): UserCreateInput {
    // Gộp firstName và lastName thành fullName cho database
    const fullName = [apiData.firstName, apiData.lastName]
      .filter(Boolean)
      .join(' ') || undefined;

    return {
      username: apiData.username,
      email: apiData.email,
      password: apiData.password,
      fullName: fullName
    };
  },

  /**
   * Convert từ API Update Request → Database Update format
   */
  fromUpdateAPI(apiData: APIUserRequest): UserUpdateInput {
    // Gộp firstName và lastName thành fullName cho database nếu có
    let fullName: string | undefined = undefined;
    if (apiData.firstName !== undefined || apiData.lastName !== undefined) {
      fullName = [apiData.firstName, apiData.lastName]
        .filter(Boolean)
        .join(' ') || undefined;
    }

    return {
      email: apiData.email,
      password: apiData.password,
      fullName: fullName,
      // avatar: apiData.avatar - Schema chưa có, skip
    };
  }
};
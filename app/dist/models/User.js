"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserConverter = exports.UserModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserModel {
    /**
     * Tìm user theo ID
     */
    static async findById(id) {
        try {
            const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)).limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding user by ID:', error);
            return null;
        }
    }
    /**
     * Tìm user theo username
     */
    static async findByUsername(username) {
        try {
            const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, username)).limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding user by username:', error);
            return null;
        }
    }
    /**
     * Tìm user theo email
     */
    static async findByEmail(email) {
        try {
            const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding user by email:', error);
            return null;
        }
    }
    /**
     * Tạo user mới
     */
    static async create(userData) {
        try {
            // Hash password
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(userData.password, salt);
            const newUser = {
                username: userData.username,
                password: hashedPassword,
                email: userData.email,
                fullName: userData.fullName || null,
                role: userData.role || 'user',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const result = await db_1.db.insert(schema_1.users).values(newUser).returning();
            // Tạo balance ban đầu cho user
            if (result[0]) {
                await db_1.db.insert(schema_1.balances).values({
                    userId: result[0].id,
                    amount: 0,
                    currency: 'USD',
                    lastUpdated: new Date(),
                });
            }
            return result[0] || null;
        }
        catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    }
    /**
     * Cập nhật user
     */
    static async update(id, userData) {
        try {
            const updateData = {
                ...userData,
                updatedAt: new Date(),
            };
            // Hash password nếu có
            if (userData.password) {
                const salt = await bcrypt_1.default.genSalt(10);
                updateData.password = await bcrypt_1.default.hash(userData.password, salt);
            }
            const result = await db_1.db.update(schema_1.users)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                .returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error updating user:', error);
            return null;
        }
    }
    /**
     * Xóa user
     */
    static async delete(id) {
        try {
            await db_1.db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
            return true;
        }
        catch (error) {
            console.error('Error deleting user:', error);
            return false;
        }
    }
    /**
     * Verify password
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt_1.default.compare(plainPassword, hashedPassword);
        }
        catch (error) {
            console.error('Error verifying password:', error);
            return false;
        }
    }
    /**
     * Update last login
     */
    static async updateLastLogin(id) {
        try {
            await db_1.db.update(schema_1.users)
                .set({ lastLogin: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        }
        catch (error) {
            console.error('Error updating last login:', error);
        }
    }
    /**
     * Get user với balance
     */
    static async findWithBalance(id) {
        try {
            const result = await db_1.db.select({
                user: schema_1.users,
                balance: schema_1.balances,
            })
                .from(schema_1.users)
                .leftJoin(schema_1.balances, (0, drizzle_orm_1.eq)(schema_1.users.id, schema_1.balances.userId))
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                .limit(1);
            if (!result[0])
                return null;
            return {
                ...result[0].user,
                balance: result[0].balance ? {
                    amount: result[0].balance.amount,
                    currency: result[0].balance.currency,
                } : undefined,
            };
        }
        catch (error) {
            console.error('Error finding user with balance:', error);
            return null;
        }
    }
}
exports.UserModel = UserModel;
/**
 * Converter để đồng bộ dữ liệu giữa Database và API
 */
exports.UserConverter = {
    /**
     * Convert từ Database User → API Response format
     */
    toAPI(dbUser) {
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
    fromRegisterAPI(apiData) {
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
    fromUpdateAPI(apiData) {
        // Gộp firstName và lastName thành fullName cho database nếu có
        let fullName = undefined;
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

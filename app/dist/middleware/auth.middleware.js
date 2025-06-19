"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
/**
 * Middleware để xác thực JWT token từ headers
 */
class AuthMiddleware {
    /**
     * Xác thực token từ Authorization header
     * @param headers Headers object từ request
     * @returns User info nếu token hợp lệ, throw error nếu không
     */
    static async authenticate(headers) {
        const authHeader = headers['Authorization'] || headers['authorization'];
        if (!authHeader) {
            throw new Error('Authorization header is required');
        }
        if (!authHeader.startsWith('Bearer ')) {
            throw new Error('Invalid authorization format. Use Bearer <token>');
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            if (!decoded || !decoded.id) {
                throw new Error('Invalid token payload');
            }
            return {
                id: decoded.id,
                username: decoded.username,
                email: decoded.email,
                role: decoded.role
            };
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
    /**
     * Kiểm tra xem có token trong headers không (optional auth)
     * @param headers Headers object từ request
     * @returns User info nếu có token hợp lệ, null nếu không có token
     */
    static async optionalAuthenticate(headers) {
        try {
            return await this.authenticate(headers);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Kiểm tra quyền truy cập
     * @param user User info từ token
     * @param requiredRole Role cần thiết
     * @returns true nếu có quyền, false nếu không
     */
    static hasRole(user, requiredRole) {
        if (requiredRole === 'admin' && user.role === 'admin') {
            return true;
        }
        if (requiredRole === 'user' && (user.role === 'user' || user.role === 'admin')) {
            return true;
        }
        return false;
    }
}
exports.AuthMiddleware = AuthMiddleware;

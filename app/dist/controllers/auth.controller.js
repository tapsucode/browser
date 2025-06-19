"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
class AuthController {
    /**
     * Handle requests from main.js routing
     * Parse method and URL to call appropriate method
     */
    static async handleRequest(method, url, data, headers = {}, authenticatedUser = null) {
        try {
            // Parse URL path: /api/auth/login -> /login
            const urlParts = url.split('/').filter(part => part !== '');
            const path = '/' + urlParts.slice(2).join('/'); // Remove 'api' and 'auth'
            switch (method) {
                case 'POST':
                    if (path === '/login') {
                        return await this.handleLogin(data);
                    }
                    else if (path === '/register') {
                        return await this.handleRegister(data);
                    }
                    else if (path === '/logout') {
                        return await this.handleLogout(data);
                    }
                    else if (path === '/forgot-password') {
                        return await this.handleForgotPassword(data);
                    }
                    else if (path === '/reset-password') {
                        return await this.handleResetPassword(data);
                    }
                    else if (path === '/verify-token') {
                        return await this.handleVerifyToken(data);
                    }
                    else {
                        throw new Error(`Unknown POST route: ${path}`);
                    }
                case 'GET':
                    if (path === '/me' || path === '/user') {
                        return await this.handleGetCurrentUser(authenticatedUser, headers);
                    }
                    else {
                        throw new Error(`Unknown GET route: ${path}`);
                    }
                case 'PATCH':
                    if (path === '/user') {
                        return await this.handleUpdateUser(data, authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown PATCH route: ${path}`);
                    }
                default:
                    throw new Error(`Unknown method: ${method}`);
            }
        }
        catch (error) {
            console.error('AuthController.handleRequest error:', error);
            throw error;
        }
    }
    // Embedded handlers that call business logic directly
    static async handleLogin(data) {
        try {
            const { username, password } = data;
            const result = await auth_service_1.AuthService.login(username, password);
            return result;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw new Error(error.message);
            }
            if (error instanceof errors_1.AuthError) {
                throw new Error(error.message);
            }
            throw new Error('Internal server error');
        }
    }
    static async handleRegister(data) {
        try {
            const apiData = data;
            if (!apiData.username || !apiData.password) {
                throw new Error('Username and password are required');
            }
            // Check existing user
            const existingUser = await User_1.UserModel.findByUsername(apiData.username);
            if (existingUser) {
                throw new errors_1.AuthError('Username already exists');
            }
            // Convert API data to database format
            const dbData = User_1.UserConverter.fromRegisterAPI(apiData);
            const user = await User_1.UserModel.create(dbData);
            if (!user) {
                throw new Error('Failed to create user');
            }
            const token = (0, jwt_1.createToken)(user);
            return {
                user: User_1.UserConverter.toAPI(user),
                token
            };
        }
        catch (error) {
            if (error instanceof errors_1.AuthError) {
                throw new Error(error.message);
            }
            throw new Error('Internal server error');
        }
    }
    static async handleLogout(data) {
        try {
            if (!data?.user?.id) {
                throw new Error('User not authenticated');
            }
            await auth_service_1.AuthService.logout(data.user.id);
            return { success: true };
        }
        catch (error) {
            if (error instanceof errors_1.AppError || error instanceof errors_1.AuthError) {
                throw new Error(error.message);
            }
            throw new Error('Internal server error');
        }
    }
    static async handleForgotPassword(data) {
        try {
            const { username } = data;
            const result = await auth_service_1.AuthService.forgotPassword(username);
            return result;
        }
        catch (error) {
            if (error instanceof errors_1.AppError || error instanceof errors_1.AuthError) {
                throw new Error(error.message);
            }
            throw new Error('Internal server error');
        }
    }
    static async handleResetPassword(data) {
        try {
            const { token, password } = data;
            const result = await auth_service_1.AuthService.resetPassword(token, password);
            return result;
        }
        catch (error) {
            if (error instanceof errors_1.AppError || error instanceof errors_1.AuthError) {
                throw new Error(error.message);
            }
            throw new Error('Internal server error');
        }
    }
    static async handleVerifyToken(data) {
        try {
            const { token } = data;
            const result = await auth_service_1.AuthService.verifyToken(token);
            return result;
        }
        catch (error) {
            if (error instanceof errors_1.AppError || error instanceof errors_1.AuthError) {
                throw new Error(error.message);
            }
            throw new Error('Internal server error');
        }
    }
    static async handleGetCurrentUser(authenticatedUser, headers) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new errors_1.AuthError('Authentication required');
            }
            const user = await User_1.UserModel.findWithBalance(parseInt(authenticatedUser.id));
            if (!user) {
                throw new errors_1.AuthError('User not found');
            }
            // Convert to API format và thêm balance info
            const apiUser = User_1.UserConverter.toAPI(user);
            return {
                ...apiUser,
                balance: user.balance
            };
        }
        catch (error) {
            if (error instanceof errors_1.AuthError) {
                throw new Error(error.message);
            }
            throw new Error('Internal server error');
        }
    }
    static async handleUpdateUser(data, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new errors_1.AuthError('Authentication required');
            }
            const result = await auth_service_1.AuthService.updateUser(parseInt(authenticatedUser.id), data);
            return result;
        }
        catch (error) {
            if (error instanceof errors_1.AppError || error instanceof errors_1.AuthError) {
                throw new Error(error.message);
            }
            throw new Error('Internal server error');
        }
    }
    static async login(data) {
        return await this.handleLogin(data);
    }
    static async logout(data) {
        return await this.handleLogout(data);
    }
    static async forgotPassword(data) {
        return await this.handleForgotPassword(data);
    }
    static async resetPassword(data) {
        return await this.handleResetPassword(data);
    }
    static async verifyToken(data) {
        return await this.handleVerifyToken(data);
    }
    static async updateUser(data, authenticatedUser) {
        return await this.handleUpdateUser(data, authenticatedUser);
    }
    static async register(data) {
        return await this.handleRegister(data);
    }
    static async getCurrentUser(authenticatedUser, headers) {
        return await this.handleGetCurrentUser(authenticatedUser, headers);
    }
}
exports.AuthController = AuthController;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceController = void 0;
const balance_service_1 = require("../services/balance.service");
const Balance_1 = require("../models/Balance");
class BalanceController {
    /**
     * Handle requests from main.js routing for /api/balance/*
     * Parse method and URL to call appropriate method
     */
    static async handleRequest(method, url, data, headers = {}, authenticatedUser = null) {
        try {
            // Parse URL path: /api/balance -> /
            const urlParts = url.split('/').filter(part => part !== '');
            const path = '/' + urlParts.slice(2).join('/'); // Remove 'api', 'balance'
            switch (method) {
                case 'GET':
                    if (path === '/') {
                        // SỬA ĐỔI: Truyền `authenticatedUser` xuống hàm con
                        return await this.handleGetBalance(authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown GET route: ${path}`);
                    }
                case 'PUT':
                    if (path === '/') {
                        // SỬA ĐỔI: Truyền `authenticatedUser` và `data` xuống hàm con
                        return await this.handleUpdateBalance(data, authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown PUT route: ${path}`);
                    }
                default:
                    throw new Error(`Unknown method: ${method}`);
            }
        }
        catch (error) {
            console.error('BalanceController.handleRequest error:', error);
            throw error;
        }
    }
    // Embedded handlers that call business logic directly
    static async handleGetBalance(authenticatedUser) {
        try {
            // SỬA ĐỔI: Kiểm tra trực tiếp `authenticatedUser`
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            // SỬA ĐỔI: Sử dụng `authenticatedUser.id`
            const balance = await balance_service_1.BalanceService.getBalance(authenticatedUser.id.toString());
            const apiResponse = Balance_1.BalanceConverter.toAPI(balance);
            return {
                success: true,
                data: apiResponse
            };
        }
        catch (error) {
            console.error('Error getting balance:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
    static async handleUpdateBalance(data, authenticatedUser) {
        try {
            // SỬA ĐỔI: Kiểm tra trực tiếp `authenticatedUser`
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            // SỬA ĐỔI: Lấy userId từ `authenticatedUser`
            const userId = authenticatedUser.id;
            const { amount, currency } = data;
            if (typeof amount !== "number") {
                throw new Error('Invalid amount');
            }
            const updateData = Balance_1.BalanceConverter.fromAPI({ amount, currency });
            const balance = await balance_service_1.BalanceService.updateBalance(userId.toString(), updateData);
            const apiResponse = Balance_1.BalanceConverter.toAPI(balance);
            return {
                success: true,
                data: apiResponse,
                message: 'Balance updated successfully'
            };
        }
        catch (error) {
            console.error('Error updating balance:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
}
exports.BalanceController = BalanceController;

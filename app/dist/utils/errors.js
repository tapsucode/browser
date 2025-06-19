"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.AuthError = void 0;
class AuthError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthError";
    }
}
exports.AuthError = AuthError;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
        // Thiết lập prototype chain đúng cách
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

export const config = {
  // Database - Place in backend data directory
  DATABASE_PATH: process.env.DATABASE_PATH || './backend/data/antidetect.db',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // Application - Updated for Electron embedded mode
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.API_BASE_URL || 'embedded://api',
  
  // Authentication
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  ACCOUNT_LOCK_TIME: parseInt(process.env.ACCOUNT_LOCK_TIME || '900000'),
  PASSWORD_RESET_EXPIRY: parseInt(process.env.PASSWORD_RESET_EXPIRY || '86400000'),
  
  // Browser
  DEFAULT_BROWSER_TYPE: process.env.DEFAULT_BROWSER_TYPE || 'chromium',
  BROWSER_DEBUGGING_PORT_START: parseInt(process.env.BROWSER_DEBUGGING_PORT_START || '9222'),
  BROWSER_SESSION_TIMEOUT: parseInt(process.env.BROWSER_SESSION_TIMEOUT || '3600000'),
  
  // File Upload - Place in backend data directory
  UPLOAD_DIR: process.env.UPLOAD_DIR || './backend/data/images',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
  ALLOWED_IMAGE_TYPES: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
  
  // Payment
  BANK_NAME: process.env.BANK_NAME || 'Vietcombank',
  BANK_ACCOUNT: process.env.BANK_ACCOUNT || '1234567890',
  BANK_ACCOUNT_HOLDER: process.env.BANK_ACCOUNT_HOLDER || 'CÔNG TY TNHH ANTI DETECT',
  PAYPAL_EMAIL: process.env.PAYPAL_EMAIL || 'payments@antidetect.com',
  BTC_ADDRESS: process.env.BTC_ADDRESS || '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
  ETH_ADDRESS: process.env.ETH_ADDRESS || '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
  USDT_TRC20_ADDRESS: process.env.USDT_TRC20_ADDRESS || 'TD3yJnw9D7pq3GKjcESzaePxPV1hTGpXXi',
  
  // Payment Fees
  BANK_FEE: parseFloat(process.env.BANK_FEE || '0.02'),
  PAYPAL_FEE: parseFloat(process.env.PAYPAL_FEE || '0.035'),
  CRYPTO_FEE: parseFloat(process.env.CRYPTO_FEE || '0.01'),
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@antidetect.com',
  
  // Data Directories - Place in backend data directory
  PROFILE_DATA_DIR: process.env.PROFILE_DATA_DIR || './backend/data/profiles',
  PROXY_DATA_DIR: process.env.PROXY_DATA_DIR || './backend/data/proxies',
  WORKFLOW_DATA_DIR: process.env.WORKFLOW_DATA_DIR || './backend/data/workflows',
  
  // System Settings
  DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE || 'Asia/Ho_Chi_Minh',
  DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE || 'vi',
  DEFAULT_THEME: process.env.DEFAULT_THEME || 'light',

  CUSTOM_CHROMIUM_PATH: process.env.CUSTOM_CHROMIUM_PATH || 'F:\\chromium\\src\\out\\chromium131\\chrome.exe',
};
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlite = exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
exports.closeDatabase = closeDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const better_sqlite3_2 = require("drizzle-orm/better-sqlite3");
const schema = __importStar(require("./schema"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const migrator_1 = require("drizzle-orm/better-sqlite3/migrator"); // <--- Dòng này phải có
// Tạo thư mục data nếu chưa tồn tại
const dataDir = path_1.default.join(process.cwd(), 'data');
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path_1.default.join(dataDir, 'database.db');
const sqlite = new better_sqlite3_1.default(dbPath);
exports.sqlite = sqlite;
// Enable foreign keys
sqlite.pragma('foreign_keys = ON');
// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');
// Create Drizzle instance
exports.db = (0, better_sqlite3_2.drizzle)(sqlite, { schema });
const migrationsFolder = path_1.default.join(__dirname, 'drizzle');
// Database initialization
async function initializeDatabase() {
    try {
        console.log('🗄️ Initializing SQLite database...');
        // --- CHẠY DRIZZLE MIGRATIONS ĐỂ TẠO CÁC BẢNG ---
        console.log(`🔍 Checking/Running migrations from: ${migrationsFolder}`);
        await (0, migrator_1.migrate)(exports.db, { migrationsFolder: migrationsFolder }); // <--- Dòng này là rất quan trọng
        console.log('✅ Migrations completed successfully');
        await createDefaultAdmin();
        console.log('✅ Database initialized successfully');
        console.log(`📁 Database path: ${dbPath}`);
    }
    catch (error) {
        console.error('❌ Failed to initialize database:', error);
        throw error;
    }
}
// Create default admin user
async function createDefaultAdmin() {
    try {
        const { UserModel } = await Promise.resolve().then(() => __importStar(require('./models/User')));
        // Check if admin user already exists
        const existingAdmin = await UserModel.findByUsername('admin');
        if (existingAdmin) {
            console.log('👤 Default admin user already exists');
            return;
        }
        // Create default admin user
        const adminData = {
            username: 'admin',
            email: 'admin@localhost',
            password: 'admin123', // Will be hashed by UserModel
            firstName: 'System',
            lastName: 'Administrator',
            role: 'admin',
            isActive: true
        };
        const admin = await UserModel.create(adminData);
        console.log('👤 Default admin user created:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   Email: admin@localhost');
    }
    catch (error) {
        console.error('❌ Failed to create default admin:', error);
        // Don't throw - database can still work without default admin
    }
}
// Graceful shutdown
function closeDatabase() {
    try {
        sqlite.close();
        console.log('🔒 Database connection closed');
    }
    catch (error) {
        console.error('❌ Error closing database:', error);
    }
}
// Handle process shutdown
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);

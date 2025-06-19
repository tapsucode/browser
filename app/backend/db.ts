import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'; // <--- Dòng này phải có


// Tạo thư mục data nếu chưa tồn tại
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.db');
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export SQLite instance for raw queries if needed
export { sqlite };
const migrationsFolder = path.join(__dirname, 'drizzle');

// Database initialization
export async function initializeDatabase() {
  try {
    console.log('🗄️ Initializing SQLite database...');
    // --- CHẠY DRIZZLE MIGRATIONS ĐỂ TẠO CÁC BẢNG ---
    console.log(`🔍 Checking/Running migrations from: ${migrationsFolder}`);
    await migrate(db, { migrationsFolder: migrationsFolder }); // <--- Dòng này là rất quan trọng
    console.log('✅ Migrations completed successfully');
    await createDefaultAdmin();
    
    console.log('✅ Database initialized successfully');
    console.log(`📁 Database path: ${dbPath}`);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Create default admin user
async function createDefaultAdmin() {
  try {
    const { UserModel } = await import('./models/User');
    
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
    
  } catch (error) {
    console.error('❌ Failed to create default admin:', error);
    // Don't throw - database can still work without default admin
  }
}

// Graceful shutdown
export function closeDatabase() {
  try {
    sqlite.close();
    console.log('🔒 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
}

// Handle process shutdown
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);
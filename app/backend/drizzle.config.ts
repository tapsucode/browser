// backend/drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
    schema: "./schema.ts", // <-- Đường dẫn đến file schema của bạn
    out: "./drizzle",     // <-- Thư mục nơi các file migrations sẽ được tạo
    driver: 'd1-http',
    dialect: "sqlite",    // <-- Thêm trường dialect để thỏa mãn kiểu Config
    dbCredentials: {
        // Đây là thông tin giả lập, không thực sự cần thiết cho `generate`,
        // nhưng Drizzle Kit yêu cầu nó cho các lệnh khác như `push`.
        accountId: 'fake-account-id',
        databaseId: 'fake-database-id',
        token: 'fake-token',
    }
} satisfies Config;
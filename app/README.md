# AntiDetect Browser Desktop App

## Khắc phục lỗi khi chạy ở local

### Lỗi đã được sửa:

**1. Lỗi Port 3000 đã được sử dụng:**
- Đã thay đổi port frontend từ 3000 sang 3001
- Cập nhật cấu hình trong `vite.config.ts` và `package.json`

**2. Lỗi không tìm thấy module backend/main.js:**
- File backend thực tế là `backend/main.ts` (TypeScript), không phải `.js`
- Đã tạo script khởi động mới `start-dev.js` sử dụng `tsx` để chạy TypeScript
- Script này sẽ khởi động các service theo đúng thứ tự với file `.ts`

### Cách chạy ứng dụng:

```bash
cd app
npm install
npm run dev
```

### Cấu trúc thư mục:
```
app/
├── backend/          # Backend Express server
├── frontend/         # React frontend
├── data/            # SQLite database và files
├── main.js          # Electron main process
├── preload.js       # Electron preload script
├── start-dev.js     # Script khởi động development
└── package.json     # Dependencies và scripts
```

### Scripts có sẵn:
- `npm run dev` - Khởi động toàn bộ ứng dụng (backend + frontend + electron)
- `npm run backend` - Chỉ chạy backend
- `npm run frontend` - Chỉ chạy frontend
- `npm start` - Chỉ chạy Electron (cần build trước)

### Troubleshooting:

**Nếu vẫn gặp lỗi port:**
```bash
# Kiểm tra port đang sử dụng
netstat -ano | findstr :3001
netstat -ano | findstr :8080

# Kill process nếu cần
taskkill /PID <PID_NUMBER> /F
```

**Nếu thiếu dependencies:**
```bash
npm install --save-dev electron electron-builder concurrently wait-on typescript tsx vite @vitejs/plugin-react
npm install express cors helmet better-sqlite3 drizzle-orm drizzle-kit zod bcrypt jsonwebtoken uuid winston playwright
```

**Nếu gặp lỗi TypeScript:**
```bash
# Cài đặt types
npm install --save-dev @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/uuid
```
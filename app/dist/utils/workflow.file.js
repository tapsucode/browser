"use strict";
// File: src/services/workflow.file.service.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowFileService = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
const env_1 = require("../config/env"); // <-- 1. Import file config
class WorkflowFileService {
    /**
     * Lấy đường dẫn tuyệt đối đến thư mục lưu trữ workflow.
     * Kết hợp đường dẫn gốc của ứng dụng với đường dẫn được định nghĩa trong config.
     * Điều này đảm bảo vị trí lưu file nhất quán cả trong development và production.
     */
    static getWorkflowsDirectory() {
        // app.getAppPath() trả về đường dẫn tới thư mục gốc của ứng dụng.
        // Ví dụ: /path/to/your-project/ hoặc /Applications/YourApp.app/Contents/Resources/app.asar
        const appRootPath = electron_1.app.getAppPath();
        // config.WORKFLOW_DATA_DIR là đường dẫn tương đối từ file config, ví dụ: './backend/data/workflows'
        // Sử dụng path.resolve để kết hợp chúng lại thành một đường dẫn tuyệt đối, an toàn.
        const workflowsPath = path.resolve(appRootPath, env_1.config.WORKFLOW_DATA_DIR);
        return workflowsPath;
    }
    /**
     * Đảm bảo thư mục lưu trữ workflows tồn tại.
     */
    static async ensureDirectoryExists() {
        const dirPath = this.getWorkflowsDirectory();
        try {
            // Dùng fs.mkdir để tạo thư mục nếu nó chưa tồn tại.
            // { recursive: true } sẽ tạo cả các thư mục cha nếu cần.
            await fs.mkdir(dirPath, { recursive: true });
        }
        catch (error) {
            console.error(`[WorkflowFileService] Failed to create workflows directory at ${dirPath}`, error);
            // Ném lỗi để các hàm gọi nó biết và xử lý.
            throw new Error('Could not setup workflow storage directory.');
        }
    }
    /**
     * Lưu nội dung workflow vào một file và trả về đường dẫn tương đối.
     * Đường dẫn tương đối này sẽ được lưu vào database.
     * @param ownerId - ID của người dùng, dùng để tạo thư mục con, tăng tính tổ chức.
     * @param workflowId - ID của workflow, dùng làm tên file.
     * @param content - Đối tượng JSON (nodes, edges) cần lưu.
     * @returns Đường dẫn tương đối của file, ví dụ: "1/123.json".
     */
    static async save(ownerId, workflowId, content) {
        await this.ensureDirectoryExists();
        // Tạo đường dẫn tương đối để lưu vào DB. Dễ quản lý và không phụ thuộc hệ thống.
        const relativePath = path.join(ownerId.toString(), `${workflowId}.json`);
        // Tạo đường dẫn tuyệt đối để ghi file.
        const fullPath = path.join(this.getWorkflowsDirectory(), relativePath);
        // Đảm bảo thư mục con của user cũng tồn tại (ví dụ: .../workflows/1/)
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        // Ghi file với định dạng JSON đẹp (null, 2) để dễ debug nếu cần.
        await fs.writeFile(fullPath, JSON.stringify(content, null, 2), 'utf-8');
        // Trả về đường dẫn tương đối.
        return relativePath;
    }
    /**
     * Đọc nội dung workflow từ một file.
     * @param relativePath - Đường dẫn tương đối được lấy từ database.
     * @returns Đối tượng JSON của workflow hoặc null nếu file không tồn tại.
     */
    static async read(relativePath) {
        if (!relativePath) {
            console.warn("[WorkflowFileService] Attempted to read from a null or empty path.");
            return null;
        }
        const fullPath = path.join(this.getWorkflowsDirectory(), relativePath);
        try {
            const fileContent = await fs.readFile(fullPath, 'utf-8');
            return JSON.parse(fileContent);
        }
        catch (error) {
            // Lỗi phổ biến nhất là file không tồn tại (ENOENT).
            // Trong trường hợp này, việc trả về null là hành vi mong muốn.
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
                console.warn(`[WorkflowFileService] Workflow file not found at: ${fullPath}`);
                return null;
            }
            // Với các lỗi khác (permission denied, file hỏng...), hãy log và ném lỗi.
            console.error(`[WorkflowFileService] Failed to read workflow file at ${fullPath}`, error);
            throw error;
        }
    }
    /**
     * Xóa một file workflow.
     * @param relativePath - Đường dẫn tương đối của file cần xóa.
     */
    static async remove(relativePath) {
        if (!relativePath)
            return;
        const fullPath = path.join(this.getWorkflowsDirectory(), relativePath);
        try {
            await fs.unlink(fullPath);
        }
        catch (error) {
            // Nếu file không tồn tại thì cũng không sao, coi như đã xóa thành công.
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
                console.warn(`[WorkflowFileService] Attempted to delete a non-existent workflow file: ${fullPath}`);
                return;
            }
            // Ném các lỗi khác.
            console.error(`[WorkflowFileService] Failed to delete workflow file at ${fullPath}`, error);
            throw error;
        }
    }
}
exports.WorkflowFileService = WorkflowFileService;

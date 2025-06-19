"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowConverter = exports.WorkflowModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class WorkflowModel {
    /**
     * Parse workflow content từ JSON string
     */
    static parseWorkflowContent(content) {
        if (typeof content === 'string') {
            // Có thể log một cảnh báo ở đây nếu muốn
            console.warn("parseWorkflowContent was called but is deprecated. Content is now a file path.");
        }
        return { nodes: [], edges: [] };
    }
    /**
     * Lấy tất cả workflow của user
     */
    static async getAllByUserId(ownerId) {
        try {
            return await db_1.db
                .select()
                .from(schema_1.workflows)
                .where((0, drizzle_orm_1.eq)(schema_1.workflows.ownerId, ownerId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.workflows.createdAt));
        }
        catch (error) {
            console.error('Error getting workflows by owner ID:', error);
            return [];
        }
    }
    /**
     * Lấy workflow theo ID
     */
    static async findById(id) {
        try {
            const result = await db_1.db
                .select()
                .from(schema_1.workflows)
                .where((0, drizzle_orm_1.eq)(schema_1.workflows.id, id))
                .limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding workflow by ID:', error);
            return null;
        }
    }
    /**
     * Lấy workflow theo ID và owner ID
     */
    static async findByIdAndOwnerId(id, ownerId) {
        try {
            const result = await db_1.db
                .select()
                .from(schema_1.workflows)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workflows.id, id), (0, drizzle_orm_1.eq)(schema_1.workflows.ownerId, ownerId)))
                .limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding workflow by ID and owner ID:', error);
            return null;
        }
    }
    /**
     * Tạo bản ghi workflow mới trong DB.
     * Cột 'workflowContent' sẽ lưu đường dẫn file.
     * @param data - Dữ liệu metadata (tên, mô tả).
     * @param filePath - Đường dẫn tới file content.
     */
    static async create(data, filePath) {
        try {
            const workflowData = {
                name: data.name,
                description: data.description || null,
                ownerId: data.ownerId,
                // THAY ĐỔI Ở ĐÂY: Lưu đường dẫn vào cột workflowContent
                workflowContent: filePath,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await db_1.db.insert(schema_1.workflows).values(workflowData).returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error creating workflow record:', error);
            return null;
        }
    }
    /**
     * Cập nhật bản ghi workflow trong DB.
     * Cột 'workflowContent' có thể được cập nhật với đường dẫn file mới.
     */
    static async update(id, data, newFilePath) {
        try {
            const updateData = {
                updatedAt: new Date()
            };
            if (data.name)
                updateData.name = data.name;
            if (data.description !== undefined)
                updateData.description = data.description;
            if (newFilePath) {
                // THAY ĐỔI Ở ĐÂY: Cập nhật đường dẫn mới vào cột workflowContent
                updateData.workflowContent = newFilePath;
            }
            if (Object.keys(updateData).length <= 1) { // Chỉ có updatedAt
                // Trả về bản ghi hiện tại nếu không có gì để update
                const currentRecord = await this.findById(id);
                return currentRecord;
            }
            const result = await db_1.db.update(schema_1.workflows).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.workflows.id, id)).returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error updating workflow record:', error);
            return null;
        }
    }
    /**
     * Xóa bản ghi workflow khỏi DB.
     */
    static async delete(id) {
        try {
            const result = await db_1.db.delete(schema_1.workflows).where((0, drizzle_orm_1.eq)(schema_1.workflows.id, id)).returning();
            return result.length > 0;
        }
        catch (error) {
            console.error('Error deleting workflow record:', error);
            return false;
        }
    }
    /**
     * Kiểm tra workflow có thuộc về user không
     */
    static async belongsToUser(id, ownerId) {
        try {
            const result = await db_1.db
                .select({ id: schema_1.workflows.id })
                .from(schema_1.workflows)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workflows.id, id), (0, drizzle_orm_1.eq)(schema_1.workflows.ownerId, ownerId)))
                .limit(1);
            return result.length > 0;
        }
        catch (error) {
            console.error('Error checking workflow ownership:', error);
            return false;
        }
    }
    /**
     * Lấy workflow content đã parse
     */
    static getWorkflowContent(workflow) {
        return this.parseWorkflowContent(workflow.workflowContent);
    }
}
exports.WorkflowModel = WorkflowModel;
/**
 * Converter để transform dữ liệu giữa Database format và API format
 */
exports.WorkflowConverter = {
    /**
     * Convert từ Database format → API Response format
     */
    toAPI(dbWorkflow) {
        try {
            // SỬA ĐỔI QUAN TRỌNG: Không còn đọc và parse content ở đây nữa.
            // Tầng Service sẽ chịu trách nhiệm đọc file và gộp dữ liệu.
            // Converter này giờ chỉ chuyển đổi các trường metadata cơ bản.
            return {
                id: dbWorkflow.id.toString(),
                name: dbWorkflow.name,
                description: dbWorkflow.description || undefined,
                createdAt: dbWorkflow.createdAt?.toISOString(),
                updatedAt: dbWorkflow.updatedAt?.toISOString(),
                // Các trường nodes và edges sẽ được thêm vào ở tầng Service sau khi đọc file.
                nodes: [], // Trả về mảng rỗng mặc định
                edges: [], // Trả về mảng rỗng mặc định
            };
        }
        catch (error) {
            console.error('Error converting workflow to API format:', error);
            throw error;
        }
    },
    /**
     * Convert từ API Request → Database format
     */
    fromAPI(apiData) {
        try {
            // Transform nodes từ API format về internal format
            const internalNodes = (apiData.nodes || []).map((node) => ({
                id: node.id,
                type: node.type,
                position: node.position || { x: 0, y: 0 },
                parameters: {
                    ...node.data?.properties,
                    label: node.data?.label || node.type
                }
            }));
            // Transform edges từ API format về internal format
            const internalEdges = (apiData.edges || []).map((edge) => ({
                id: edge.id,
                from: edge.source,
                to: edge.target,
                type: edge.type || 'default',
                animated: edge.animated || false,
                label: edge.label || '',
                style: edge.style || {}
            }));
            return {
                name: apiData.name,
                description: apiData.description,
                workflowContent: {
                    nodes: internalNodes,
                    edges: internalEdges
                }
            };
        }
        catch (error) {
            console.error('Error converting workflow from API format:', error);
            throw error;
        }
    }
};

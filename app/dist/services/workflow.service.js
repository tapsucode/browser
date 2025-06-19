"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const Workflow_1 = require("../models/Workflow");
const zod_1 = require("zod");
const workflow_file_1 = require("../utils/workflow.file");
// Validation schemas
const createWorkflowSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(255, "Name too long"),
    description: zod_1.z.string().optional(),
    workflowContent: zod_1.z
        .object({
        nodes: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            type: zod_1.z.string(),
            position: zod_1.z.object({
                x: zod_1.z.number(),
                y: zod_1.z.number(),
            }).optional().default({ x: 0, y: 0 }),
            parameters: zod_1.z.record(zod_1.z.any()).optional().default({}),
            data: zod_1.z.record(zod_1.z.any()).optional().default({}),
        })),
        edges: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            from: zod_1.z.string(),
            to: zod_1.z.string(),
            type: zod_1.z.string().optional().default("default"),
        })),
    })
        .optional()
        .default({ nodes: [], edges: [] }),
});
const updateWorkflowSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    description: zod_1.z.string().optional(),
    workflowContent: zod_1.z
        .object({
        nodes: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            type: zod_1.z.string(),
            position: zod_1.z.object({
                x: zod_1.z.number(),
                y: zod_1.z.number(),
            }).optional().default({ x: 0, y: 0 }),
            parameters: zod_1.z.record(zod_1.z.any()).optional().default({}),
            data: zod_1.z.record(zod_1.z.any()).optional().default({}),
        })),
        edges: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            from: zod_1.z.string(),
            to: zod_1.z.string(),
            type: zod_1.z.string().optional().default("default"),
        })),
    })
        .optional(),
});
class WorkflowService {
    /**
     * Lấy danh sách workflows cho user
     */
    static async getAllWorkflowsByUserId(ownerId) {
        if (!ownerId) {
            throw new Error("User not authenticated");
        }
        const workflowsFromDb = await Workflow_1.WorkflowModel.getAllByUserId(ownerId);
        // SỬA ĐỔI: Chỉ trả về các thông tin cần thiết cho danh sách.
        // Không cần đọc nội dung file của TẤT CẢ các workflow, rất tốn kém.
        // Client chỉ cần metadata để hiển thị list.
        return workflowsFromDb.map((wf) => ({
            id: wf.id.toString(),
            name: wf.name,
            description: wf.description || "",
            createdAt: wf.createdAt,
            updatedAt: wf.updatedAt,
        }));
    }
    /**
     * Lấy workflow theo ID và owner ID
     */
    static async getWorkflowByIdAndOwner(id, ownerId) {
        if (!ownerId)
            throw new Error("User not authenticated");
        if (!id)
            throw new Error("Workflow ID is required");
        // 1. Lấy metadata từ DB
        const workflowRecord = await Workflow_1.WorkflowModel.findByIdAndOwnerId(id, ownerId);
        if (!workflowRecord)
            throw new Error("Workflow not found or access denied");
        // 2. Đọc nội dung từ file system bằng đường dẫn trong cột `workflowContent`
        // workflowRecord.workflowContent bây giờ chứa đường dẫn, ví dụ: "1/123.json"
        const workflowContentObject = await workflow_file_1.WorkflowFileService.read(workflowRecord.workflowContent);
        // 3. Gộp lại và trả về cho client
        return {
            id: workflowRecord.id.toString(),
            name: workflowRecord.name,
            description: workflowRecord.description,
            // Gộp trực tiếp các thuộc tính từ object đã đọc (nodes, edges)
            ...(workflowContentObject || { nodes: [], edges: [] }),
            createdAt: workflowRecord.createdAt,
            updatedAt: workflowRecord.updatedAt,
        };
    }
    /**
     * Tạo workflow mới: tạo bản ghi DB trước để lấy ID, sau đó lưu file, rồi cập nhật lại DB.
     */
    static async createWorkflow(data, ownerId) {
        if (!ownerId)
            throw new Error("User not authenticated");
        // Validate... (giữ nguyên)
        // 1. Tạo bản ghi "tạm" trong DB để lấy ID.
        // Dùng một đường dẫn placeholder để cột `workflowContent` không bị null.
        const tempRecordData = { name: data.name, description: data.description, ownerId };
        const newWorkflowRecord = await Workflow_1.WorkflowModel.create(tempRecordData, 'pending_save.json');
        if (!newWorkflowRecord)
            throw new Error("Failed to create initial workflow record");
        const newId = newWorkflowRecord.id;
        try {
            // 2. Dùng ID mới nhận được để lưu file, tạo ra đường dẫn chính xác
            const filePath = await workflow_file_1.WorkflowFileService.save(ownerId, newId, data.workflowContent);
            // 3. Cập nhật lại bản ghi trong DB với đường dẫn file chính xác
            const finalWorkflowRecord = await Workflow_1.WorkflowModel.update(newId, {}, filePath);
            if (!finalWorkflowRecord)
                throw new Error("Failed to finalize workflow creation by updating path");
            // 4. Trả về dữ liệu đã gộp
            return this.getWorkflowByIdAndOwner(newId, ownerId);
        }
        catch (error) {
            // Nếu có lỗi ở bước 2 hoặc 3, xóa bản ghi tạm đã tạo
            await Workflow_1.WorkflowModel.delete(newId);
            console.error("Workflow creation failed during file save, rolling back...", error);
            throw new Error("Failed to save workflow content to file.");
        }
    }
    /**
     * Cập nhật workflow
     */
    /**
     * Cập nhật workflow: cập nhật file và/hoặc metadata trong DB.
     */
    static async updateWorkflow(id, data, ownerId) {
        if (!ownerId)
            throw new Error("User not authenticated");
        if (!id)
            throw new Error("Workflow ID is required");
        // 1. Kiểm tra quyền sở hữu
        const existingWorkflow = await Workflow_1.WorkflowModel.findByIdAndOwnerId(id, ownerId);
        if (!existingWorkflow)
            throw new Error("Workflow not found or access denied");
        // Validate... (giữ nguyên)
        let newFilePath = undefined;
        // 2. Nếu có `workflowContent` mới, ghi đè file cũ
        if (data.workflowContent) {
            newFilePath = await workflow_file_1.WorkflowFileService.save(ownerId, id, data.workflowContent);
        }
        // 3. Cập nhật metadata và đường dẫn mới (nếu có) vào DB
        const metadataToUpdate = { name: data.name, description: data.description };
        const updatedRecord = await Workflow_1.WorkflowModel.update(id, metadataToUpdate, newFilePath);
        if (!updatedRecord)
            throw new Error("Failed to update workflow record");
        // 4. Trả về dữ liệu mới nhất
        return this.getWorkflowByIdAndOwner(id, ownerId);
    }
    /**
     * Xóa workflow: xóa file trước, rồi xóa bản ghi trong DB.
     */
    static async deleteWorkflow(id, ownerId) {
        if (!ownerId)
            throw new Error("User not authenticated");
        if (!id)
            throw new Error("Workflow ID is required");
        // 1. Lấy thông tin workflow để biết đường dẫn file cần xóa
        const workflowToDelete = await Workflow_1.WorkflowModel.findByIdAndOwnerId(id, ownerId);
        if (!workflowToDelete)
            throw new Error("Workflow not found or access denied");
        // 2. Xóa file vật lý từ đường dẫn trong cột `workflowContent`
        await workflow_file_1.WorkflowFileService.remove(workflowToDelete.workflowContent);
        // 3. Xóa bản ghi trong DB
        const success = await Workflow_1.WorkflowModel.delete(id);
        if (!success)
            throw new Error("Failed to delete workflow record from database");
        return true;
    }
    /**
     * Kiểm tra workflow có thuộc về user không
     */
    static async checkWorkflowOwnership(id, ownerId) {
        if (!ownerId) {
            throw new Error("User not authenticated");
        }
        if (!id) {
            throw new Error("Workflow ID is required");
        }
        return await Workflow_1.WorkflowModel.belongsToUser(id, ownerId);
    }
    /**
     * Duplicate workflow
     */
    static async duplicateWorkflow(originalId, // Đổi tên `id` thành `originalId` cho rõ ràng
    ownerId, newName) {
        if (!ownerId)
            throw new Error("User not authenticated");
        if (!originalId)
            throw new Error("Original workflow ID is required");
        // 1. LẤY DỮ LIỆU WORKFLOW GỐC (bao gồm cả metadata và content)
        // Dùng lại hàm getWorkflowByIdAndOwner để lấy cả nội dung file
        const originalWorkflow = await this.getWorkflowByIdAndOwner(originalId, ownerId);
        // Nếu hàm trên không throw lỗi, nghĩa là workflow tồn tại và user có quyền
        // 2. CHUẨN BỊ DỮ LIỆU CHO WORKFLOW MỚI
        const newWorkflowData = {
            // Nếu không có `newName` được cung cấp, tự động tạo tên mới
            name: newName || `${originalWorkflow.name} (Copy)`,
            description: originalWorkflow.description,
            ownerId: ownerId,
            // Lấy nội dung nodes/edges từ workflow gốc
            workflowContent: {
                nodes: originalWorkflow.nodes || [],
                edges: originalWorkflow.edges || [],
            },
        };
        // 3. TẠO WORKFLOW MỚI BẰNG CÁCH GỌI LẠI HÀM `createWorkflow`
        // Tận dụng lại toàn bộ logic tạo bản ghi, lưu file, và rollback đã có sẵn!
        // Đây là cách làm rất hiệu quả và tránh lặp lại code.
        try {
            const duplicatedWorkflow = await this.createWorkflow(newWorkflowData, ownerId);
            return duplicatedWorkflow;
        }
        catch (error) {
            console.error(`Error duplicating workflow ID ${originalId}:`, error);
            // Lỗi sẽ được bắt và re-throw bởi createWorkflow, nhưng ta log thêm context ở đây
            throw new Error(`Failed to create a duplicate of workflow ${originalId}`);
        }
    }
    /**
     * Export workflow
     */
    static async exportWorkflow(id, ownerId) {
        // Tạo export data với metadata
        return null;
    }
    /**
     * Import workflow
     */
    static async importWorkflow(importData, ownerId) {
        // Convert to API format for response
        return null;
    }
    /**
     * Validate workflow content
     */
    static validateWorkflowContent(workflowContent) {
        const errors = [];
        if (!workflowContent) {
            errors.push("Workflow content is required");
            return { isValid: false, errors };
        }
        if (!workflowContent.nodes || !Array.isArray(workflowContent.nodes)) {
            errors.push("Workflow must have nodes array");
        }
        if (!workflowContent.edges || !Array.isArray(workflowContent.edges)) {
            errors.push("Workflow must have edges array");
        }
        // Validate nodes
        if (workflowContent.nodes) {
            workflowContent.nodes.forEach((node, index) => {
                if (!node.id) {
                    errors.push(`Node at index ${index} must have an id`);
                }
                if (!node.type) {
                    errors.push(`Node at index ${index} must have a type`);
                }
            });
        }
        // Validate edges
        if (workflowContent.edges) {
            workflowContent.edges.forEach((edge, index) => {
                if (!edge.id) {
                    errors.push(`Edge at index ${index} must have an id`);
                }
                if (!edge.from) {
                    errors.push(`Edge at index ${index} must have a from node`);
                }
                if (!edge.to) {
                    errors.push(`Edge at index ${index} must have a to node`);
                }
            });
        }
        return { isValid: errors.length === 0, errors };
    }
}
exports.WorkflowService = WorkflowService;

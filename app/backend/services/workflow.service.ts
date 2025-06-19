import {
  WorkflowModel,
  WorkflowCreateInput,
  WorkflowUpdateInput,
  WorkflowConverter,
} from "../models/Workflow";
import { z } from "zod";
import { WorkflowFileService } from "../utils/workflow.file";

// Validation schemas
const createWorkflowSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().optional(),
  workflowContent: z
    .object({
      nodes: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          position: z.object({
            x: z.number(),
            y: z.number(),
          }).optional().default({ x: 0, y: 0 }),
          parameters: z.record(z.any()).optional().default({}),
          data: z.record(z.any()).optional().default({}),
        }),
      ),
      edges: z.array(
        z.object({
          id: z.string(),
          from: z.string(),
          to: z.string(),
          type: z.string().optional().default("default"),
        }),
      ),
    })
    .optional()
    .default({ nodes: [], edges: [] }),
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  workflowContent: z
    .object({
      nodes: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          position: z.object({
            x: z.number(),
            y: z.number(),
          }).optional().default({ x: 0, y: 0 }),
          parameters: z.record(z.any()).optional().default({}),
          data: z.record(z.any()).optional().default({}),
        }),
      ),
      edges: z.array(
        z.object({
          id: z.string(),
          from: z.string(),
          to: z.string(),
          type: z.string().optional().default("default"),
        }),
      ),
    })
    .optional(),
});

export class WorkflowService {
  /**
   * Lấy danh sách workflows cho user
   */
  static async getAllWorkflowsByUserId(ownerId: number): Promise<any[]> {
    if (!ownerId) {
      throw new Error("User not authenticated");
    }

    const workflowsFromDb = await WorkflowModel.getAllByUserId(ownerId);

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
  static async getWorkflowByIdAndOwner(id: number, ownerId: number): Promise<any> {
    if (!ownerId) throw new Error("User not authenticated");
    if (!id) throw new Error("Workflow ID is required");

    // 1. Lấy metadata từ DB
    const workflowRecord = await WorkflowModel.findByIdAndOwnerId(id, ownerId);
    if (!workflowRecord) throw new Error("Workflow not found or access denied");

    // 2. Đọc nội dung từ file system bằng đường dẫn trong cột `workflowContent`
    // workflowRecord.workflowContent bây giờ chứa đường dẫn, ví dụ: "1/123.json"
    const workflowContentObject = await WorkflowFileService.read(workflowRecord.workflowContent);

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
  static async createWorkflow(data: WorkflowCreateInput, ownerId: number): Promise<any> {
    if (!ownerId) throw new Error("User not authenticated");

    // Validate... (giữ nguyên)
    
    // 1. Tạo bản ghi "tạm" trong DB để lấy ID.
    // Dùng một đường dẫn placeholder để cột `workflowContent` không bị null.
    const tempRecordData = { name: data.name, description: data.description, ownerId };
    const newWorkflowRecord = await WorkflowModel.create(tempRecordData, 'pending_save.json');
    if (!newWorkflowRecord) throw new Error("Failed to create initial workflow record");

    const newId = newWorkflowRecord.id;

    try {
      // 2. Dùng ID mới nhận được để lưu file, tạo ra đường dẫn chính xác
      const filePath = await WorkflowFileService.save(ownerId, newId, data.workflowContent);

      // 3. Cập nhật lại bản ghi trong DB với đường dẫn file chính xác
      const finalWorkflowRecord = await WorkflowModel.update(newId, {}, filePath);
      if (!finalWorkflowRecord) throw new Error("Failed to finalize workflow creation by updating path");

      // 4. Trả về dữ liệu đã gộp
      return this.getWorkflowByIdAndOwner(newId, ownerId);
    } catch (error) {
      // Nếu có lỗi ở bước 2 hoặc 3, xóa bản ghi tạm đã tạo
      await WorkflowModel.delete(newId);
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
  static async updateWorkflow(id: number, data: WorkflowUpdateInput, ownerId: number): Promise<any> {
    if (!ownerId) throw new Error("User not authenticated");
    if (!id) throw new Error("Workflow ID is required");

    // 1. Kiểm tra quyền sở hữu
    const existingWorkflow = await WorkflowModel.findByIdAndOwnerId(id, ownerId);
    if (!existingWorkflow) throw new Error("Workflow not found or access denied");

    // Validate... (giữ nguyên)

    let newFilePath: string | undefined = undefined;
    // 2. Nếu có `workflowContent` mới, ghi đè file cũ
    if (data.workflowContent) {
      newFilePath = await WorkflowFileService.save(ownerId, id, data.workflowContent);
    }

    // 3. Cập nhật metadata và đường dẫn mới (nếu có) vào DB
    const metadataToUpdate = { name: data.name, description: data.description };
    const updatedRecord = await WorkflowModel.update(id, metadataToUpdate, newFilePath);
    if (!updatedRecord) throw new Error("Failed to update workflow record");

    // 4. Trả về dữ liệu mới nhất
    return this.getWorkflowByIdAndOwner(id, ownerId);
  }


  /**
   * Xóa workflow: xóa file trước, rồi xóa bản ghi trong DB.
   */
  static async deleteWorkflow(id: number, ownerId: number): Promise<boolean> {
    if (!ownerId) throw new Error("User not authenticated");
    if (!id) throw new Error("Workflow ID is required");

    // 1. Lấy thông tin workflow để biết đường dẫn file cần xóa
    const workflowToDelete = await WorkflowModel.findByIdAndOwnerId(id, ownerId);
    if (!workflowToDelete) throw new Error("Workflow not found or access denied");

    // 2. Xóa file vật lý từ đường dẫn trong cột `workflowContent`
    await WorkflowFileService.remove(workflowToDelete.workflowContent);
    
    // 3. Xóa bản ghi trong DB
    const success = await WorkflowModel.delete(id);
    if (!success) throw new Error("Failed to delete workflow record from database");

    return true;
  }


  /**
   * Kiểm tra workflow có thuộc về user không
   */
  static async checkWorkflowOwnership(
    id: number,
    ownerId: number,
  ): Promise<boolean> {
    if (!ownerId) {
      throw new Error("User not authenticated");
    }

    if (!id) {
      throw new Error("Workflow ID is required");
    }

    return await WorkflowModel.belongsToUser(id, ownerId);
  }

  /**
   * Duplicate workflow
   */
  static async duplicateWorkflow(
    originalId: number, // Đổi tên `id` thành `originalId` cho rõ ràng
    ownerId: number,
    newName?: string,
  ): Promise<any> {
    if (!ownerId) throw new Error("User not authenticated");
    if (!originalId) throw new Error("Original workflow ID is required");

    // 1. LẤY DỮ LIỆU WORKFLOW GỐC (bao gồm cả metadata và content)
    // Dùng lại hàm getWorkflowByIdAndOwner để lấy cả nội dung file
    const originalWorkflow = await this.getWorkflowByIdAndOwner(originalId, ownerId);
    
    // Nếu hàm trên không throw lỗi, nghĩa là workflow tồn tại và user có quyền
    
    // 2. CHUẨN BỊ DỮ LIỆU CHO WORKFLOW MỚI
    const newWorkflowData: WorkflowCreateInput = {
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
    } catch (error) {
      console.error(`Error duplicating workflow ID ${originalId}:`, error);
      // Lỗi sẽ được bắt và re-throw bởi createWorkflow, nhưng ta log thêm context ở đây
      throw new Error(`Failed to create a duplicate of workflow ${originalId}`);
    }
  }

  /**
   * Export workflow
   */
  static async exportWorkflow(id: number, ownerId: number): Promise<any> {
    
    // Tạo export data với metadata
    return null;
  }

  /**
   * Import workflow
   */
  static async importWorkflow(importData: any, ownerId: number): Promise<any> {
    

    // Convert to API format for response
    return null;
  }

  /**
   * Validate workflow content
   */
  static validateWorkflowContent(workflowContent: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

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
      workflowContent.nodes.forEach((node: any, index: number) => {
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
      workflowContent.edges.forEach((edge: any, index: number) => {
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

import { db } from '../db';
import { workflows, type Workflow, type InsertWorkflow } from '../schema';
import { eq, desc, and } from 'drizzle-orm';

export interface WorkflowCreateInput {
  name: string;
  description?: string;
  workflowContent: {
    nodes: Array<{
      id: string;
      type: string;
      parameters: Record<string, any>;
    }>;
    edges: Array<{
      id: string;
      from: string;
      to: string;
    }>;
  };
  ownerId: number;
}

export interface WorkflowUpdateInput {
  name?: string;
  description?: string;
  workflowContent?: {
    nodes: Array<{
      id: string;
      type: string;
      parameters: Record<string, any>;
    }>;
    edges: Array<{
      id: string;
      from: string;
      to: string;
    }>;
  };
}

export class WorkflowModel {
  /**
   * Parse workflow content từ JSON string
   */
  public static parseWorkflowContent(content: string | null): any {

    if (typeof content === 'string') {
        // Có thể log một cảnh báo ở đây nếu muốn
        console.warn("parseWorkflowContent was called but is deprecated. Content is now a file path.");
    }
    return { nodes: [], edges: [] };
  }

  /**
   * Lấy tất cả workflow của user
   */
  static async getAllByUserId(ownerId: number): Promise<Workflow[]> {
    try {
      return await db
        .select()
        .from(workflows)
        .where(eq(workflows.ownerId, ownerId))
        .orderBy(desc(workflows.createdAt));
    } catch (error) {
      console.error('Error getting workflows by owner ID:', error);
      return [];
    }
  }

  /**
   * Lấy workflow theo ID
   */
  static async findById(id: number): Promise<Workflow | null> {
    try {
      const result = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, id))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Error finding workflow by ID:', error);
      return null;
    }
  }

  /**
   * Lấy workflow theo ID và owner ID
   */
  static async findByIdAndOwnerId(id: number, ownerId: number): Promise<Workflow | null> {
    try {
      const result = await db
        .select()
        .from(workflows)
        .where(and(eq(workflows.id, id), eq(workflows.ownerId, ownerId)))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
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
  static async create(data: Omit<WorkflowCreateInput, 'workflowContent'>, filePath: string): Promise<Workflow | null> {
    try {
      const workflowData: InsertWorkflow = {
        name: data.name,
        description: data.description || null,
        ownerId: data.ownerId,
        // THAY ĐỔI Ở ĐÂY: Lưu đường dẫn vào cột workflowContent
        workflowContent: filePath,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.insert(workflows).values(workflowData).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error creating workflow record:', error);
      return null;
    }
  }

  /**
   * Cập nhật bản ghi workflow trong DB.
   * Cột 'workflowContent' có thể được cập nhật với đường dẫn file mới.
   */
  static async update(id: number, data: Omit<WorkflowUpdateInput, 'workflowContent'>, newFilePath?: string): Promise<Workflow | null> {
    try {
      const updateData: Partial<InsertWorkflow> = {
        updatedAt: new Date()
      };

      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (newFilePath) {
        // THAY ĐỔI Ở ĐÂY: Cập nhật đường dẫn mới vào cột workflowContent
        updateData.workflowContent = newFilePath;
      }

      if (Object.keys(updateData).length <= 1) { // Chỉ có updatedAt
          // Trả về bản ghi hiện tại nếu không có gì để update
          const currentRecord = await this.findById(id);
          return currentRecord;
      }

      const result = await db.update(workflows).set(updateData).where(eq(workflows.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating workflow record:', error);
      return null;
    }
  }

  /**
   * Xóa bản ghi workflow khỏi DB.
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await db.delete(workflows).where(eq(workflows.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting workflow record:', error);
      return false;
    }
  }

  /**
   * Kiểm tra workflow có thuộc về user không
   */
  static async belongsToUser(id: number, ownerId: number): Promise<boolean> {
    try {
      const result = await db
        .select({ id: workflows.id })
        .from(workflows)
        .where(and(eq(workflows.id, id), eq(workflows.ownerId, ownerId)))
        .limit(1);
      
      return result.length > 0;
    } catch (error) {
      console.error('Error checking workflow ownership:', error);
      return false;
    }
  }

  /**
   * Lấy workflow content đã parse
   */
  static getWorkflowContent(workflow: Workflow): any {
    return this.parseWorkflowContent(workflow.workflowContent);
  }
}

/**
 * Converter để transform dữ liệu giữa Database format và API format
 */
export const WorkflowConverter = {
  /**
   * Convert từ Database format → API Response format
   */
  toAPI(dbWorkflow: Workflow): any {
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
    } catch (error) {
      console.error('Error converting workflow to API format:', error);
      throw error;
    }
  },

  /**
   * Convert từ API Request → Database format
   */
  fromAPI(apiData: any): any {
    try {
      // Transform nodes từ API format về internal format
      const internalNodes = (apiData.nodes || []).map((node: any) => ({
        id: node.id,
        type: node.type,
        position: node.position || { x: 0, y: 0 },
        parameters: {
          ...node.data?.properties,
          label: node.data?.label || node.type
        }
      }));

      // Transform edges từ API format về internal format
      const internalEdges = (apiData.edges || []).map((edge: any) => ({
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
    } catch (error) {
      console.error('Error converting workflow from API format:', error);
      throw error;
    }
  }
};
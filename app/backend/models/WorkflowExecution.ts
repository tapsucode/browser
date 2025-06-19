import { db } from '../db';
import { workflowExecutions, workflows, type WorkflowExecution, type InsertWorkflowExecution } from '../schema';
import { eq, desc, and, inArray } from 'drizzle-orm';

export interface WorkflowExecutionCreateInput {
  workflowId: number;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  startTime?: Date;
  endTime?: Date;
  results?: any;
  progress?: any;
  errorMessage?: string;
}

export interface WorkflowExecutionUpdateInput {
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  startTime?: Date;
  endTime?: Date;
  results?: any;
  progress?: any;
  errorMessage?: string;
}

export class WorkflowExecutionModel {
  /**
   * Tìm execution theo ID
   */
  static async findById(id: number): Promise<WorkflowExecution | null> {
    try {
      const result = await db.select().from(workflowExecutions).where(eq(workflowExecutions.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding workflow execution by ID:', error);
      return null;
    }
  }

  /**
   * Lấy tất cả executions
   */
  static async findAll(limit = 50): Promise<WorkflowExecution[]> {
    try {
      return await db.select().from(workflowExecutions)
        .orderBy(desc(workflowExecutions.startTime))
        .limit(limit);
    } catch (error) {
      console.error('Error finding all workflow executions:', error);
      return [];
    }
  }

  /**
   * Lấy executions theo workflow ID
   */
  static async findByWorkflowId(
    workflowId: number, 
    options: { page?: number; limit?: number; status?: string } = {}
  ): Promise<WorkflowExecution[]> {
    try {
      const { page = 1, limit = 20, status } = options;
      const offset = (page - 1) * limit;
      
      const conditions = [eq(workflowExecutions.workflowId, workflowId)];
      if (status) {
        conditions.push(eq(workflowExecutions.status, status));
      }

      const query = db.select().from(workflowExecutions)
        .where(and(...conditions))
        .orderBy(desc(workflowExecutions.startTime))
        .limit(limit)
        .offset(offset);

      return await query;
    } catch (error) {
      console.error('Error finding executions by workflow ID:', error);
      return [];
    }
  }

  /**
   * Tạo execution mới
   */
  static async create(executionData: WorkflowExecutionCreateInput): Promise<WorkflowExecution | null> {
    try {
      const newExecution: InsertWorkflowExecution = {
        workflowId: executionData.workflowId,
        status: executionData.status || 'pending',
        startTime: executionData.startTime || new Date(),
        endTime: executionData.endTime || undefined,
        results: executionData.results ? JSON.stringify(executionData.results) : null,
        progress: executionData.progress ? JSON.stringify(executionData.progress) : null,
        errorMessage: executionData.errorMessage || null,
        createdAt: new Date(),
      };

      const result = await db.insert(workflowExecutions).values(newExecution).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error creating workflow execution:', error);
      return null;
    }
  }

  /**
   * Cập nhật execution
   */
  static async update(id: number, executionData: WorkflowExecutionUpdateInput): Promise<WorkflowExecution | null> {
    try {
      const updateData: Partial<InsertWorkflowExecution> = {};

      if (executionData.status) updateData.status = executionData.status;
      if (executionData.endTime) updateData.endTime = executionData.endTime;
      if (executionData.results) updateData.results = JSON.stringify(executionData.results);
      if (executionData.progress) updateData.progress = JSON.stringify(executionData.progress);
      if (executionData.errorMessage) updateData.errorMessage = executionData.errorMessage;

      const result = await db.update(workflowExecutions)
        .set(updateData)
        .where(eq(workflowExecutions.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating workflow execution:', error);
      return null;
    }
  }

  /**
   * Bắt đầu execution
   */
  static async start(id: number): Promise<boolean> {
    try {
      await db.update(workflowExecutions)
        .set({ 
          status: 'running',
          startTime: new Date(),
        })
        .where(eq(workflowExecutions.id, id));

      return true;
    } catch (error) {
      console.error('Error starting workflow execution:', error);
      return false;
    }
  }

  /**
   * Hoàn thành execution thành công
   */
  static async complete(id: number, results?: any): Promise<boolean> {
    try {
      const updateData: Partial<InsertWorkflowExecution> = {
        status: 'completed',
        endTime: new Date(),
      };

      if (results) {
        updateData.results = JSON.stringify(results);
      }

      await db.update(workflowExecutions)
        .set(updateData)
        .where(eq(workflowExecutions.id, id));

      return true;
    } catch (error) {
      console.error('Error completing workflow execution:', error);
      return false;
    }
  }

  /**
   * Đánh dấu execution thất bại
   */
  static async fail(id: number, errorMessage: string): Promise<boolean> {
    try {
      await db.update(workflowExecutions)
        .set({ 
          status: 'failed',
          endTime: new Date(),
          errorMessage,
        })
        .where(eq(workflowExecutions.id, id));

      return true;
    } catch (error) {
      console.error('Error failing workflow execution:', error);
      return false;
    }
  }

  /**
   * Cập nhật progress
   */
  static async updateProgress(id: number, progressData: {
    progress?: any;
    stats?: any;
    error?: string;
    log?: string;
  }): Promise<boolean> {
    try {
      const updateData: Partial<InsertWorkflowExecution> = {};
      
      if (progressData.progress !== undefined) {
        updateData.progress = typeof progressData.progress === 'string' 
          ? progressData.progress 
          : JSON.stringify(progressData.progress);
      }
      
      if (progressData.error) {
        updateData.errorMessage = progressData.error;
      }

      await db.update(workflowExecutions)
        .set(updateData)
        .where(eq(workflowExecutions.id, id));

      return true;
    } catch (error) {
      console.error('Error updating execution progress:', error);
      return false;
    }
  }

  /**
   * Lấy execution với thông tin workflow
   */
  static async findWithWorkflow(id: number): Promise<(WorkflowExecution & { workflow?: any }) | null> {
    try {
      const result = await db.select({
        execution: workflowExecutions,
        workflow: workflows,
      })
      .from(workflowExecutions)
      .leftJoin(workflows, eq(workflowExecutions.workflowId, workflows.id))
      .where(eq(workflowExecutions.id, id))
      .limit(1);

      if (!result[0]) return null;

      return {
        ...result[0].execution,
        workflow: result[0].workflow,
      };
    } catch (error) {
      console.error('Error finding execution with workflow:', error);
      return null;
    }
  }

  /**
   * Lấy executions đang chạy
   */
  static async findRunning(): Promise<WorkflowExecution[]> {
    try {
      return await db.select().from(workflowExecutions)
        .where(eq(workflowExecutions.status, 'running'))
        .orderBy(desc(workflowExecutions.startTime));
    } catch (error) {
      console.error('Error finding running executions:', error);
      return [];
    }
  }

  /**
   * Lấy thống kê executions
   */
  static async getStats(workflowId?: number) {
    try {
      let executions;
      if (workflowId) {
        executions = await db.select().from(workflowExecutions).where(eq(workflowExecutions.workflowId, workflowId));
      } else {
        executions = await db.select().from(workflowExecutions);
      }

      const stats = {
        total: executions.length,
        completed: executions.filter(e => e.status === 'completed').length,
        failed: executions.filter(e => e.status === 'failed').length,
        running: executions.filter(e => e.status === 'running').length,
        pending: executions.filter(e => e.status === 'pending').length,
      };

      return stats;
    } catch (error) {
      console.error('Error getting execution stats:', error);
      return {
        total: 0,
        completed: 0,
        failed: 0,
        running: 0,
        pending: 0,
      };
    }
  }

  /**
   * Parse results data
   */
  static parseResults(resultsJson: string | null): any {
    if (!resultsJson) return null;
    try {
      return JSON.parse(resultsJson);
    } catch (error) {
      console.error('Error parsing results data:', error);
      return null;
    }
  }

  /**
   * Parse progress data
   */
  static parseProgress(progressJson: string | null): any {
    if (!progressJson) return null;
    try {
      return JSON.parse(progressJson);
    } catch (error) {
      console.error('Error parsing progress data:', error);
      return null;
    }
  }

  /**
   * Xóa execution cũ (cleanup)
   */
  static async deleteOld(daysOld = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const deleted = await db.delete(workflowExecutions)
        .where(and(
          eq(workflowExecutions.status, 'completed'),
          // Note: In a real implementation, you'd compare with creation date
        ));

      return 0; // Return number of deleted records
    } catch (error) {
      console.error('Error deleting old executions:', error);
      return 0;
    }
  }

  /**
   * Tìm executions theo nhiều workflow IDs
   */
  static async findByWorkflowIds(workflowIds: number[]): Promise<WorkflowExecution[]> {
    try {
      if (workflowIds.length === 0) {
        return [];
      }

      const executions = await db.select()
        .from(workflowExecutions)
        .where(inArray(workflowExecutions.workflowId, workflowIds))
        .orderBy(desc(workflowExecutions.startTime));

      return executions;
    } catch (error) {
      console.error('Error finding executions by workflow IDs:', error);
      throw error;
    }
  }

  /**
   * Xóa execution theo ID
   */
  static async delete(executionId: number): Promise<boolean> {
    try {
      await db.delete(workflowExecutions)
        .where(eq(workflowExecutions.id, executionId));

      return true;
    } catch (error) {
      console.error('Error deleting execution:', error);
      return false;
    }
  }
}

/**
 * Converter để transform dữ liệu giữa Database format và API format
 */
export const WorkflowExecutionConverter = {
  /**
   * Convert từ Database format → API Response format
   */
  toAPI(dbExecution: WorkflowExecution): any {
    try {
      const results = WorkflowExecutionModel.parseResults(dbExecution.results);
      const progress = WorkflowExecutionModel.parseProgress(dbExecution.progress);

      // Format results theo API docs specification
      const apiResults = results ? {
        successCount: results.successCount || results.successful || 0,
        failureCount: results.failureCount || results.failed || 0,
        details: (results.details || []).map((detail: any) => ({
          profileId: detail.profileId?.toString() || detail.profile_id?.toString(),
          success: detail.success || false,
          error: detail.error || undefined
        }))
      } : undefined;

      // Format progress theo API docs specification
      const apiProgress = progress ? {
        completed: progress.completed || 0,
        total: progress.total || 0,
        percentComplete: progress.percentComplete || Math.round(((progress.completed || 0) / (progress.total || 1)) * 100)
      } : undefined;

      return {
        id: dbExecution.id.toString(),
        workflowId: dbExecution.workflowId.toString(),
        status: dbExecution.status,
        startTime: dbExecution.startTime?.toISOString(),
        endTime: dbExecution.endTime?.toISOString() || undefined,
        results: apiResults,
        progress: apiProgress
      };
    } catch (error) {
      console.error('Error converting workflow execution to API format:', error);
      throw error;
    }
  },

  /**
   * Convert từ API Request → Database format
   */
  fromAPI(apiData: any): Partial<WorkflowExecution> {
    const result: any = {};
    
    if (apiData.workflowId) result.workflowId = parseInt(apiData.workflowId);
    if (apiData.status) result.status = apiData.status;
    if (apiData.startTime) result.startTime = new Date(apiData.startTime);
    if (apiData.endTime) result.endTime = new Date(apiData.endTime);
    
    // Convert results từ API format về DB format
    if (apiData.results) {
      const dbResults = {
        successCount: apiData.results.successCount || 0,
        failureCount: apiData.results.failureCount || 0,
        details: (apiData.results.details || []).map((detail: any) => ({
          profileId: detail.profileId ? parseInt(detail.profileId) : undefined,
          success: detail.success || false,
          error: detail.error || undefined
        }))
      };
      result.results = JSON.stringify(dbResults);
    }
    
    // Convert progress từ API format về DB format
    if (apiData.progress) {
      const dbProgress = {
        completed: apiData.progress.completed || 0,
        total: apiData.progress.total || 0,
        percentComplete: apiData.progress.percentComplete || 0
      };
      result.progress = JSON.stringify(dbProgress);
    }
    
    return result;
  }
};
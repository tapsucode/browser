"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionConverter = exports.WorkflowExecutionModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class WorkflowExecutionModel {
    /**
     * Tìm execution theo ID
     */
    static async findById(id) {
        try {
            const result = await db_1.db.select().from(schema_1.workflowExecutions).where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.id, id)).limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding workflow execution by ID:', error);
            return null;
        }
    }
    /**
     * Lấy tất cả executions
     */
    static async findAll(limit = 50) {
        try {
            return await db_1.db.select().from(schema_1.workflowExecutions)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.workflowExecutions.startTime))
                .limit(limit);
        }
        catch (error) {
            console.error('Error finding all workflow executions:', error);
            return [];
        }
    }
    /**
     * Lấy executions theo workflow ID
     */
    static async findByWorkflowId(workflowId, options = {}) {
        try {
            const { page = 1, limit = 20, status } = options;
            const offset = (page - 1) * limit;
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.workflowExecutions.workflowId, workflowId)];
            if (status) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.status, status));
            }
            const query = db_1.db.select().from(schema_1.workflowExecutions)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.workflowExecutions.startTime))
                .limit(limit)
                .offset(offset);
            return await query;
        }
        catch (error) {
            console.error('Error finding executions by workflow ID:', error);
            return [];
        }
    }
    /**
     * Tạo execution mới
     */
    static async create(executionData) {
        try {
            const newExecution = {
                workflowId: executionData.workflowId,
                status: executionData.status || 'pending',
                startTime: executionData.startTime || new Date(),
                endTime: executionData.endTime || undefined,
                results: executionData.results ? JSON.stringify(executionData.results) : null,
                progress: executionData.progress ? JSON.stringify(executionData.progress) : null,
                errorMessage: executionData.errorMessage || null,
                createdAt: new Date(),
            };
            const result = await db_1.db.insert(schema_1.workflowExecutions).values(newExecution).returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error creating workflow execution:', error);
            return null;
        }
    }
    /**
     * Cập nhật execution
     */
    static async update(id, executionData) {
        try {
            const updateData = {};
            if (executionData.status)
                updateData.status = executionData.status;
            if (executionData.endTime)
                updateData.endTime = executionData.endTime;
            if (executionData.results)
                updateData.results = JSON.stringify(executionData.results);
            if (executionData.progress)
                updateData.progress = JSON.stringify(executionData.progress);
            if (executionData.errorMessage)
                updateData.errorMessage = executionData.errorMessage;
            const result = await db_1.db.update(schema_1.workflowExecutions)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.id, id))
                .returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error updating workflow execution:', error);
            return null;
        }
    }
    /**
     * Bắt đầu execution
     */
    static async start(id) {
        try {
            await db_1.db.update(schema_1.workflowExecutions)
                .set({
                status: 'running',
                startTime: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.id, id));
            return true;
        }
        catch (error) {
            console.error('Error starting workflow execution:', error);
            return false;
        }
    }
    /**
     * Hoàn thành execution thành công
     */
    static async complete(id, results) {
        try {
            const updateData = {
                status: 'completed',
                endTime: new Date(),
            };
            if (results) {
                updateData.results = JSON.stringify(results);
            }
            await db_1.db.update(schema_1.workflowExecutions)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.id, id));
            return true;
        }
        catch (error) {
            console.error('Error completing workflow execution:', error);
            return false;
        }
    }
    /**
     * Đánh dấu execution thất bại
     */
    static async fail(id, errorMessage) {
        try {
            await db_1.db.update(schema_1.workflowExecutions)
                .set({
                status: 'failed',
                endTime: new Date(),
                errorMessage,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.id, id));
            return true;
        }
        catch (error) {
            console.error('Error failing workflow execution:', error);
            return false;
        }
    }
    /**
     * Cập nhật progress
     */
    static async updateProgress(id, progressData) {
        try {
            const updateData = {};
            if (progressData.progress !== undefined) {
                updateData.progress = typeof progressData.progress === 'string'
                    ? progressData.progress
                    : JSON.stringify(progressData.progress);
            }
            if (progressData.error) {
                updateData.errorMessage = progressData.error;
            }
            await db_1.db.update(schema_1.workflowExecutions)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.id, id));
            return true;
        }
        catch (error) {
            console.error('Error updating execution progress:', error);
            return false;
        }
    }
    /**
     * Lấy execution với thông tin workflow
     */
    static async findWithWorkflow(id) {
        try {
            const result = await db_1.db.select({
                execution: schema_1.workflowExecutions,
                workflow: schema_1.workflows,
            })
                .from(schema_1.workflowExecutions)
                .leftJoin(schema_1.workflows, (0, drizzle_orm_1.eq)(schema_1.workflowExecutions.workflowId, schema_1.workflows.id))
                .where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.id, id))
                .limit(1);
            if (!result[0])
                return null;
            return {
                ...result[0].execution,
                workflow: result[0].workflow,
            };
        }
        catch (error) {
            console.error('Error finding execution with workflow:', error);
            return null;
        }
    }
    /**
     * Lấy executions đang chạy
     */
    static async findRunning() {
        try {
            return await db_1.db.select().from(schema_1.workflowExecutions)
                .where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.status, 'running'))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.workflowExecutions.startTime));
        }
        catch (error) {
            console.error('Error finding running executions:', error);
            return [];
        }
    }
    /**
     * Lấy thống kê executions
     */
    static async getStats(workflowId) {
        try {
            let executions;
            if (workflowId) {
                executions = await db_1.db.select().from(schema_1.workflowExecutions).where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.workflowId, workflowId));
            }
            else {
                executions = await db_1.db.select().from(schema_1.workflowExecutions);
            }
            const stats = {
                total: executions.length,
                completed: executions.filter(e => e.status === 'completed').length,
                failed: executions.filter(e => e.status === 'failed').length,
                running: executions.filter(e => e.status === 'running').length,
                pending: executions.filter(e => e.status === 'pending').length,
            };
            return stats;
        }
        catch (error) {
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
    static parseResults(resultsJson) {
        if (!resultsJson)
            return null;
        try {
            return JSON.parse(resultsJson);
        }
        catch (error) {
            console.error('Error parsing results data:', error);
            return null;
        }
    }
    /**
     * Parse progress data
     */
    static parseProgress(progressJson) {
        if (!progressJson)
            return null;
        try {
            return JSON.parse(progressJson);
        }
        catch (error) {
            console.error('Error parsing progress data:', error);
            return null;
        }
    }
    /**
     * Xóa execution cũ (cleanup)
     */
    static async deleteOld(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            const deleted = await db_1.db.delete(schema_1.workflowExecutions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.status, 'completed')));
            return 0; // Return number of deleted records
        }
        catch (error) {
            console.error('Error deleting old executions:', error);
            return 0;
        }
    }
    /**
     * Tìm executions theo nhiều workflow IDs
     */
    static async findByWorkflowIds(workflowIds) {
        try {
            if (workflowIds.length === 0) {
                return [];
            }
            const executions = await db_1.db.select()
                .from(schema_1.workflowExecutions)
                .where((0, drizzle_orm_1.inArray)(schema_1.workflowExecutions.workflowId, workflowIds))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.workflowExecutions.startTime));
            return executions;
        }
        catch (error) {
            console.error('Error finding executions by workflow IDs:', error);
            throw error;
        }
    }
    /**
     * Xóa execution theo ID
     */
    static async delete(executionId) {
        try {
            await db_1.db.delete(schema_1.workflowExecutions)
                .where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.id, executionId));
            return true;
        }
        catch (error) {
            console.error('Error deleting execution:', error);
            return false;
        }
    }
}
exports.WorkflowExecutionModel = WorkflowExecutionModel;
/**
 * Converter để transform dữ liệu giữa Database format và API format
 */
exports.WorkflowExecutionConverter = {
    /**
     * Convert từ Database format → API Response format
     */
    toAPI(dbExecution) {
        try {
            const results = WorkflowExecutionModel.parseResults(dbExecution.results);
            const progress = WorkflowExecutionModel.parseProgress(dbExecution.progress);
            // Format results theo API docs specification
            const apiResults = results ? {
                successCount: results.successCount || results.successful || 0,
                failureCount: results.failureCount || results.failed || 0,
                details: (results.details || []).map((detail) => ({
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
        }
        catch (error) {
            console.error('Error converting workflow execution to API format:', error);
            throw error;
        }
    },
    /**
     * Convert từ API Request → Database format
     */
    fromAPI(apiData) {
        const result = {};
        if (apiData.workflowId)
            result.workflowId = parseInt(apiData.workflowId);
        if (apiData.status)
            result.status = apiData.status;
        if (apiData.startTime)
            result.startTime = new Date(apiData.startTime);
        if (apiData.endTime)
            result.endTime = new Date(apiData.endTime);
        // Convert results từ API format về DB format
        if (apiData.results) {
            const dbResults = {
                successCount: apiData.results.successCount || 0,
                failureCount: apiData.results.failureCount || 0,
                details: (apiData.results.details || []).map((detail) => ({
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

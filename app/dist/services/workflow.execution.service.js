"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionService = void 0;
const WorkflowExecution_1 = require("../models/WorkflowExecution");
const Workflow_1 = require("../models/Workflow");
const Profile_1 = require("../models/Profile");
const ProfileGroup_1 = require("../models/ProfileGroup");
const zod_1 = require("zod");
// Validation schemas
const executeWorkflowSchema = zod_1.z.object({
    workflowId: zod_1.z.number().int().positive('Workflow ID must be a positive integer'),
    targetType: zod_1.z.enum(['profile', 'group', 'profiles_batch']).default('profile'),
    targetId: zod_1.z.number().int().positive().optional(),
    profileId: zod_1.z.number().int().positive().optional(),
    profileIds: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
    groupId: zod_1.z.number().int().positive().optional(),
    threads: zod_1.z.number().int().min(1).max(10).default(1),
    variables: zod_1.z.record(zod_1.z.any()).default({}),
    options: zod_1.z.object({
        headless: zod_1.z.boolean().default(true),
        timeout: zod_1.z.number().int().min(1000).max(300000).default(30000), // 30 seconds default
        waitUntil: zod_1.z.enum(['load', 'networkidle']).default('networkidle'),
        retryOnFail: zod_1.z.boolean().default(false),
        maxRetries: zod_1.z.number().int().min(0).max(3).default(0)
    }).default({})
});
class WorkflowExecutionService {
    /**
     * Execute workflow với validation đầy đủ
     */
    static async executeWorkflow(workflowId, userId, data) {
        if (!userId) {
            throw new Error('User not authenticated');
        }
        if (!workflowId) {
            throw new Error('Workflow ID is required');
        }
        // Validate request body
        const validationResult = executeWorkflowSchema.safeParse(data);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new Error(`Invalid execution parameters: ${JSON.stringify(errors)}`);
        }
        const executionParams = validationResult.data;
        // Verify workflow exists and belongs to user
        const workflow = await Workflow_1.WorkflowModel.findByIdAndOwnerId(workflowId, userId);
        if (!workflow) {
            throw new Error('Workflow not found or access denied');
        }
        // Validate target profiles/groups exist
        await this.validateExecutionTargets(executionParams);
        // Create execution record
        const executionData = {
            workflowId: workflowId,
            status: 'pending',
            startTime: new Date(),
            results: undefined,
            progress: JSON.stringify({ completed: 0, total: 0, percentComplete: 0 }),
            errorMessage: undefined
        };
        const execution = await WorkflowExecution_1.WorkflowExecutionModel.create(executionData);
        if (!execution) {
            throw new Error('Failed to create execution record');
        }
        // Start execution asynchronously
        setImmediate(async () => {
            await this.runWorkflowExecution(execution, workflow, executionParams, userId);
        });
        // Convert to API format
        return WorkflowExecution_1.WorkflowExecutionConverter.toAPI(execution);
    }
    /**
     * Validate execution targets (profiles/groups)
     */
    static async validateExecutionTargets(executionParams) {
        if (executionParams.targetType === 'profile' && executionParams.profileId) {
            const profile = await Profile_1.ProfileModel.findById(executionParams.profileId);
            if (!profile) {
                throw new Error('Specified profile not found');
            }
        }
        else if (executionParams.targetType === 'group' && executionParams.groupId) {
            const group = await ProfileGroup_1.ProfileGroupModel.findById(executionParams.groupId);
            if (!group) {
                throw new Error('Specified profile group not found');
            }
        }
    }
    /**
     * Run workflow execution using the existing workflow engine
     */
    static async runWorkflowExecution(execution, workflow, executionParams, userId) {
        try {
            // Update status to running
            await WorkflowExecution_1.WorkflowExecutionModel.update(execution.id, { status: 'running' });
            // Parse workflow content
            const workflowContent = typeof workflow.workflowContent === 'string'
                ? JSON.parse(workflow.workflowContent)
                : workflow.workflowContent;
            // Workflow execution should only be called after profile is launched
            // This service is now primarily for execution management, not actual execution
            // Actual execution happens through ProfileService.executeWorkflowWithProfile()
            throw new Error('WorkflowExecutionService.executeWorkflow() is deprecated. Use ProfileService.executeWorkflowWithProfile() instead.');
        }
        catch (error) {
            console.error('Workflow execution failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await WorkflowExecution_1.WorkflowExecutionModel.update(execution.id, {
                status: 'failed',
                endTime: new Date(),
                errorMessage: errorMessage
            });
        }
    }
    /**
     * Stop workflow execution
     */
    static async stopExecution(executionId, userId) {
        if (!userId) {
            throw new Error('User not authenticated');
        }
        if (!executionId) {
            throw new Error('Execution ID is required');
        }
        const execution = await WorkflowExecution_1.WorkflowExecutionModel.findById(executionId);
        if (!execution) {
            throw new Error('Execution not found');
        }
        // Verify ownership through workflow
        const workflow = await Workflow_1.WorkflowModel.findByIdAndOwnerId(execution.workflowId, userId);
        if (!workflow) {
            throw new Error('Access denied');
        }
        if (execution.status !== 'running' && execution.status !== 'pending') {
            throw new Error('Cannot stop execution that is not running');
        }
        // Update execution status
        const updatedExecution = await WorkflowExecution_1.WorkflowExecutionModel.update(executionId, {
            status: 'stopped',
            endTime: new Date(),
            errorMessage: 'Execution stopped by user'
        });
        if (!updatedExecution) {
            throw new Error('Failed to stop execution');
        }
        return WorkflowExecution_1.WorkflowExecutionConverter.toAPI(updatedExecution);
    }
    /**
     * Get execution details
     */
    static async getExecutionById(executionId, userId) {
        if (!userId) {
            throw new Error('User not authenticated');
        }
        if (!executionId) {
            throw new Error('Execution ID is required');
        }
        const execution = await WorkflowExecution_1.WorkflowExecutionModel.findById(executionId);
        if (!execution) {
            throw new Error('Execution not found');
        }
        // Verify ownership through workflow
        const workflow = await Workflow_1.WorkflowModel.findByIdAndOwnerId(execution.workflowId, userId);
        if (!workflow) {
            throw new Error('Access denied');
        }
        return WorkflowExecution_1.WorkflowExecutionConverter.toAPI(execution);
    }
    /**
     * Get all executions for a workflow
     */
    static async getExecutionsByWorkflow(workflowId, userId) {
        if (!userId) {
            throw new Error('User not authenticated');
        }
        if (!workflowId) {
            throw new Error('Workflow ID is required');
        }
        // Verify workflow ownership
        const workflow = await Workflow_1.WorkflowModel.findByIdAndOwnerId(workflowId, userId);
        if (!workflow) {
            throw new Error('Workflow not found or access denied');
        }
        const executions = await WorkflowExecution_1.WorkflowExecutionModel.findByWorkflowId(workflowId);
        return executions.map(execution => WorkflowExecution_1.WorkflowExecutionConverter.toAPI(execution));
    }
    /**
     * Get all executions for user
     */
    static async getAllExecutionsForUser(userId) {
        if (!userId) {
            throw new Error('User not authenticated');
        }
        // Get all user's workflows first
        const workflows = await Workflow_1.WorkflowModel.getAllByUserId(userId);
        const workflowIds = workflows.map(w => w.id);
        if (workflowIds.length === 0) {
            return [];
        }
        // Get executions for all user's workflows
        const executions = await WorkflowExecution_1.WorkflowExecutionModel.findByWorkflowIds(workflowIds);
        return executions.map(execution => WorkflowExecution_1.WorkflowExecutionConverter.toAPI(execution));
    }
    /**
     * Delete execution
     */
    static async deleteExecution(executionId, userId) {
        if (!userId) {
            throw new Error('User not authenticated');
        }
        if (!executionId) {
            throw new Error('Execution ID is required');
        }
        const execution = await WorkflowExecution_1.WorkflowExecutionModel.findById(executionId);
        if (!execution) {
            throw new Error('Execution not found');
        }
        // Verify ownership through workflow
        const workflow = await Workflow_1.WorkflowModel.findByIdAndOwnerId(execution.workflowId, userId);
        if (!workflow) {
            throw new Error('Access denied');
        }
        const success = await WorkflowExecution_1.WorkflowExecutionModel.delete(executionId);
        if (!success) {
            throw new Error('Failed to delete execution');
        }
        return true;
    }
    /**
     * Batch delete executions
     */
    static async batchDeleteExecutions(executionIds, userId) {
        if (!userId) {
            throw new Error('User not authenticated');
        }
        if (!executionIds || executionIds.length === 0) {
            throw new Error('Execution IDs are required');
        }
        let deletedCount = 0;
        const failedIds = [];
        for (const executionId of executionIds) {
            try {
                await this.deleteExecution(executionId, userId);
                deletedCount++;
            }
            catch (error) {
                console.error(`Failed to delete execution ${executionId}:`, error);
                failedIds.push(executionId);
            }
        }
        return {
            success: deletedCount > 0,
            deletedCount,
            failedIds
        };
    }
    /**
     * Get execution statistics for user
     */
    static async getExecutionStats(userId) {
        if (!userId) {
            throw new Error('User not authenticated');
        }
        const executions = await this.getAllExecutionsForUser(userId);
        const stats = {
            total: executions.length,
            completed: executions.filter(e => e.status === 'completed').length,
            failed: executions.filter(e => e.status === 'failed').length,
            running: executions.filter(e => e.status === 'running').length,
            stopped: executions.filter(e => e.status === 'stopped').length,
            pending: executions.filter(e => e.status === 'pending').length
        };
        return stats;
    }
    /**
     * Execute workflow with group
     */
    static async executeWorkflowWithGroup(workflowId, userId, data) {
        if (!userId) {
            throw new Error('User not authenticated');
        }
        if (!workflowId) {
            throw new Error('Workflow ID is required');
        }
        const { groupId, profileIds, threads = 1 } = data;
        // If groupId is provided, get profiles from the group
        let targetProfileIds = profileIds || [];
        if (groupId) {
            const groupProfiles = await ProfileGroup_1.ProfileGroupModel.getProfiles(groupId);
            if (groupProfiles.length === 0) {
                throw new Error('No profiles found in the specified group');
            }
            targetProfileIds = groupProfiles.map(p => p.id);
        }
        if (targetProfileIds.length === 0) {
            throw new Error('No profiles specified for execution');
        }
        // Use the regular executeWorkflow method with the resolved profile IDs
        return await this.executeWorkflow(workflowId, userId, {
            profileIds: targetProfileIds,
            threads
        });
    }
}
exports.WorkflowExecutionService = WorkflowExecutionService;

import { WorkflowExecutionModel, WorkflowExecutionCreateInput, WorkflowExecutionUpdateInput, WorkflowExecutionConverter } from '../models/WorkflowExecution';
import { WorkflowModel } from '../models/Workflow';
import { ProfileModel } from '../models/Profile';
import { ProfileGroupModel } from '../models/ProfileGroup';
import { z } from 'zod';

// Import workflow engine utilities
import { execute } from '../workflow/engine';

// Validation schemas
const executeWorkflowSchema = z.object({
  workflowId: z.number().int().positive('Workflow ID must be a positive integer'),
  targetType: z.enum(['profile', 'group', 'profiles_batch']).default('profile'),
  targetId: z.number().int().positive().optional(),
  profileId: z.number().int().positive().optional(),
  profileIds: z.array(z.number().int().positive()).optional(),
  groupId: z.number().int().positive().optional(),
  threads: z.number().int().min(1).max(10).default(1),
  variables: z.record(z.any()).default({}),
  options: z.object({
    headless: z.boolean().default(true),
    timeout: z.number().int().min(1000).max(300000).default(30000), // 30 seconds default
    waitUntil: z.enum(['load', 'networkidle']).default('networkidle'),
    retryOnFail: z.boolean().default(false),
    maxRetries: z.number().int().min(0).max(3).default(0)
  }).default({})
});



export class WorkflowExecutionService {
  /**
   * Execute workflow với validation đầy đủ
   */
  static async executeWorkflow(workflowId: number, userId: number, data: any): Promise<any> {
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
    const workflow = await WorkflowModel.findByIdAndOwnerId(workflowId, userId);
    if (!workflow) {
      throw new Error('Workflow not found or access denied');
    }

    // Validate target profiles/groups exist
    await this.validateExecutionTargets(executionParams);

    // Create execution record
    const executionData: WorkflowExecutionCreateInput = {
      workflowId: workflowId,
      status: 'pending',
      startTime: new Date(),
      results: undefined,
      progress: JSON.stringify({ completed: 0, total: 0, percentComplete: 0 }),
      errorMessage: undefined
    };

    const execution = await WorkflowExecutionModel.create(executionData);
    if (!execution) {
      throw new Error('Failed to create execution record');
    }

    // Start execution asynchronously
    setImmediate(async () => {
      await this.runWorkflowExecution(execution, workflow, executionParams, userId);
    });

    // Convert to API format
    return WorkflowExecutionConverter.toAPI(execution);
  }

  /**
   * Validate execution targets (profiles/groups)
   */
  private static async validateExecutionTargets(executionParams: any): Promise<void> {
    if (executionParams.targetType === 'profile' && executionParams.profileId) {
      const profile = await ProfileModel.findById(executionParams.profileId);
      if (!profile) {
        throw new Error('Specified profile not found');
      }
    } else if (executionParams.targetType === 'group' && executionParams.groupId) {
      const group = await ProfileGroupModel.findById(executionParams.groupId);
      if (!group) {
        throw new Error('Specified profile group not found');
      }
    }
  }

  /**
   * Run workflow execution using the existing workflow engine
   */
  private static async runWorkflowExecution(
    execution: any,
    workflow: any,
    executionParams: any,
    userId: number
  ): Promise<void> {
    try {
      // Update status to running
      await WorkflowExecutionModel.update(execution.id, { status: 'running' });

      // Parse workflow content
      const workflowContent = typeof workflow.workflowContent === 'string' 
        ? JSON.parse(workflow.workflowContent) 
        : workflow.workflowContent;

      // Workflow execution should only be called after profile is launched
      // This service is now primarily for execution management, not actual execution
      // Actual execution happens through ProfileService.executeWorkflowWithProfile()
      
      throw new Error('WorkflowExecutionService.executeWorkflow() is deprecated. Use ProfileService.executeWorkflowWithProfile() instead.');

    } catch (error) {
      console.error('Workflow execution failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await WorkflowExecutionModel.update(execution.id, {
        status: 'failed',
        endTime: new Date(),
        errorMessage: errorMessage
      });
    }
  }

  /**
   * Stop workflow execution
   */
  static async stopExecution(executionId: number, userId: number): Promise<any> {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (!executionId) {
      throw new Error('Execution ID is required');
    }

    const execution = await WorkflowExecutionModel.findById(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    // Verify ownership through workflow
    const workflow = await WorkflowModel.findByIdAndOwnerId(execution.workflowId, userId);
    if (!workflow) {
      throw new Error('Access denied');
    }

    if (execution.status !== 'running' && execution.status !== 'pending') {
      throw new Error('Cannot stop execution that is not running');
    }

    // Update execution status
    const updatedExecution = await WorkflowExecutionModel.update(executionId, {
      status: 'stopped',
      endTime: new Date(),
      errorMessage: 'Execution stopped by user'
    });

    if (!updatedExecution) {
      throw new Error('Failed to stop execution');
    }

    return WorkflowExecutionConverter.toAPI(updatedExecution);
  }

  /**
   * Get execution details
   */
  static async getExecutionById(executionId: number, userId: number): Promise<any> {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (!executionId) {
      throw new Error('Execution ID is required');
    }

    const execution = await WorkflowExecutionModel.findById(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    // Verify ownership through workflow
    const workflow = await WorkflowModel.findByIdAndOwnerId(execution.workflowId, userId);
    if (!workflow) {
      throw new Error('Access denied');
    }

    return WorkflowExecutionConverter.toAPI(execution);
  }

  /**
   * Get all executions for a workflow
   */
  static async getExecutionsByWorkflow(workflowId: number, userId: number): Promise<any[]> {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    // Verify workflow ownership
    const workflow = await WorkflowModel.findByIdAndOwnerId(workflowId, userId);
    if (!workflow) {
      throw new Error('Workflow not found or access denied');
    }

    const executions = await WorkflowExecutionModel.findByWorkflowId(workflowId);
    return executions.map(execution => WorkflowExecutionConverter.toAPI(execution));
  }

  /**
   * Get all executions for user
   */
  static async getAllExecutionsForUser(userId: number): Promise<any[]> {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get all user's workflows first
    const workflows = await WorkflowModel.getAllByUserId(userId);
    const workflowIds = workflows.map(w => w.id);

    if (workflowIds.length === 0) {
      return [];
    }

    // Get executions for all user's workflows
    const executions = await WorkflowExecutionModel.findByWorkflowIds(workflowIds);
    return executions.map(execution => WorkflowExecutionConverter.toAPI(execution));
  }

  /**
   * Delete execution
   */
  static async deleteExecution(executionId: number, userId: number): Promise<boolean> {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (!executionId) {
      throw new Error('Execution ID is required');
    }

    const execution = await WorkflowExecutionModel.findById(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    // Verify ownership through workflow
    const workflow = await WorkflowModel.findByIdAndOwnerId(execution.workflowId, userId);
    if (!workflow) {
      throw new Error('Access denied');
    }

    const success = await WorkflowExecutionModel.delete(executionId);
    if (!success) {
      throw new Error('Failed to delete execution');
    }

    return true;
  }

  /**
   * Batch delete executions
   */
  static async batchDeleteExecutions(executionIds: number[], userId: number): Promise<{
    success: boolean;
    deletedCount: number;
    failedIds: number[];
  }> {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (!executionIds || executionIds.length === 0) {
      throw new Error('Execution IDs are required');
    }

    let deletedCount = 0;
    const failedIds: number[] = [];

    for (const executionId of executionIds) {
      try {
        await this.deleteExecution(executionId, userId);
        deletedCount++;
      } catch (error) {
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
  static async getExecutionStats(userId: number): Promise<any> {
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
  static async executeWorkflowWithGroup(workflowId: number, userId: number, data: any): Promise<any> {
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
      const groupProfiles = await ProfileGroupModel.getProfiles(groupId);
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
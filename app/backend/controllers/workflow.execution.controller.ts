import { WorkflowExecutionService } from '../services/workflow.execution.service';
import { type AuthenticatedUser } from '../middleware/auth.middleware';
export class WorkflowExecutionController {
  /**
   * Handle requests from main.js routing for /api/workflows/execution/*
   * Parse method and URL to call appropriate method
   */
  static async handleRequest(method: string, url: string, data: any, headers: any = {}, authenticatedUser: AuthenticatedUser | null = null): Promise<any> {
    try {
      const urlParts = url.split('/').filter(part => part !== '');
      const path = '/' + urlParts.slice(3).join('/');
      
      switch (method) {
        case 'GET':
          if (path === '/') {
            // SỬA ĐỔI
            return await this.handleGetAllExecutionsForUser(authenticatedUser);
          } else if (path === '/stats') {
            // SỬA ĐỔI
            return await this.handleGetExecutionStats(authenticatedUser);
          } else if (path.match(/^\/\d+$/)) {
            const executionId = parseInt(path.substring(1));
            // SỬA ĐỔI
            return await this.handleGetExecutionById(executionId, authenticatedUser);
          } else {
            throw new Error(`Unknown GET route: ${path}`);
          }
          
        case 'POST':
          if (path.match(/^\/\d+\/stop$/)) {
            const executionId = parseInt(path.split('/')[1]);
            // SỬA ĐỔI
            return await this.handleStopExecution(executionId, authenticatedUser);
          } else if (path === '/batch') {
            // SỬA ĐỔI
            return await this.handleBatchDeleteExecutions(data, authenticatedUser);
          } else {
            throw new Error(`Unknown POST route: ${path}`);
          }
          
        case 'DELETE':
          if (path.match(/^\/\d+$/)) {
            const executionId = parseInt(path.substring(1));
            // SỬA ĐỔI
            return await this.handleDeleteExecution(executionId, authenticatedUser);
          } else if (path === '/batch') {
            // SỬA ĐỔI
            return await this.handleBatchDeleteExecutions(data, authenticatedUser);
          } else {
            throw new Error(`Unknown DELETE route: ${path}`);
          }
          
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      console.error('WorkflowExecutionController.handleRequest error:', error);
      throw error;
    }
  }

  // Embedded handlers that call business logic directly
  private static async handleStopExecution(executionId: number, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = parseInt(authenticatedUser.id);

      if (!executionId) {
        throw new Error('Invalid execution ID');
      }

      const result = await WorkflowExecutionService.stopExecution(executionId, userId);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to stop execution');
      }

      return result;
    } catch (error: any) {
      console.error('Stop execution error:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private static async handleGetExecutionById(executionId: number, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = parseInt(authenticatedUser.id);

      if (!executionId) {
        throw new Error('Invalid execution ID');
      }

      const result = await WorkflowExecutionService.getExecutionById(executionId, userId);
      
      if (!result.success) {
        throw new Error(result.message || 'Execution not found');
      }

      return result;
    } catch (error: any) {
      console.error('Get execution by ID error:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private static async handleGetExecutionsByWorkflow(workflowId: number, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = parseInt(authenticatedUser.id);

      if (!workflowId) {
        throw new Error('Invalid workflow ID');
      }

      const result = await WorkflowExecutionService.getExecutionsByWorkflow(workflowId, userId);
      return result;
    } catch (error: any) {
      console.error('Get executions by workflow error:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private static async handleGetAllExecutionsForUser(authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = parseInt(authenticatedUser.id);

      const result = await WorkflowExecutionService.getAllExecutionsForUser(userId);
      return result;
    } catch (error: any) {
      console.error('Get all executions for user error:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private static async handleDeleteExecution(executionId: number, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = parseInt(authenticatedUser.id);

      if (!executionId) {
        throw new Error('Invalid execution ID');
      }

      const result = await WorkflowExecutionService.deleteExecution(executionId, userId);
      
      if (!result) {
        throw new Error('Failed to delete execution');
      }

      return result;
    } catch (error: any) {
      console.error('Delete execution error:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private static async handleBatchDeleteExecutions(data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = parseInt(authenticatedUser.id);

      const { executionIds } = data;
      if (!Array.isArray(executionIds) || executionIds.length === 0) {
        throw new Error('executionIds must be a non-empty array');
      }

      const result = await WorkflowExecutionService.batchDeleteExecutions(executionIds, userId);
      return result;
    } catch (error: any) {
      console.error('Batch delete executions error:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private static async handleGetExecutionStats(authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = parseInt(authenticatedUser.id);

      const result = await WorkflowExecutionService.getExecutionStats(userId);
      return result;
    } catch (error: any) {
      console.error('Get execution stats error:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private static async handleExecuteWorkflow(data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = parseInt(authenticatedUser.id);

      const { workflowId, profileId, options = {} } = data;

      if (!workflowId || !profileId) {
        throw new Error('workflowId and profileId are required');
      }

      const result = await WorkflowExecutionService.executeWorkflow(
        workflowId,
        userId,
        { profileId, options }
      );

      return {
        success: true,
        executionId: result.id,
        message: 'Workflow execution started successfully'
      };
    } catch (error: any) {
      console.error('Execute workflow error:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private static async handleExecuteWorkflowWithGroup(data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const userId = parseInt(authenticatedUser.id);

      const { workflowId, groupId, concurrent = 1, options = {} } = data;

      if (!workflowId || !groupId) {
        throw new Error('workflowId and groupId are required');
      }

      const result = await WorkflowExecutionService.executeWorkflowWithGroup(
        workflowId,
        userId,
        { groupId, concurrent, options }
      );

      return {
        success: true,
        executionIds: [result.id],
        message: 'Workflow execution with group started successfully'
      };
    } catch (error: any) {
      console.error('Execute workflow with group error:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }
}
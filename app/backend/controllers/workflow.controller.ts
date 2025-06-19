import { WorkflowService } from '../services/workflow.service';
import { type AuthenticatedUser } from '../middleware/auth.middleware';

export class WorkflowController {
  /**
   * Handle requests from main.js routing for /api/workflows/*
   * Parse method and URL to call appropriate method
   */
  static async handleRequest(method: string, url: string, data: any, headers: any = {}, authenticatedUser: AuthenticatedUser | null = null): Promise<any> {
    try {
      const urlParts = url.split('/').filter(part => part !== '');
      const path = '/' + urlParts.slice(2).join('/');
      
      switch (method) {
        case 'GET':
          if (path === '/') {
            // SỬA ĐỔI
            return await this.handleGetAllWorkflows(authenticatedUser);
          } else if (path.match(/^\/\d+$/)) {
            const id = parseInt(path.substring(1));
            // SỬA ĐỔI
            return await this.handleGetWorkflowById(id, authenticatedUser);
          } else if (path.match(/^\/\d+\/executions$/)) {
            const id = parseInt(path.split('/')[1]);
            // SỬA ĐỔI
            return await this.handleGetExecutionsByWorkflow(id, authenticatedUser);
          } else if (path.match(/^\/\d+\/export$/)) {
            const id = parseInt(path.split('/')[1]);
            // SỬA ĐỔI
            return await this.handleExportWorkflow(id, authenticatedUser);
          } else {
            throw new Error(`Unknown GET route: ${path}`);
          }
          
        case 'POST':
          if (path === '/') {
            // SỬA ĐỔI
            return await this.handleCreateWorkflow(data, authenticatedUser);
          } else if (path === '/import') {
            // SỬA ĐỔI
            return await this.handleImportWorkflow(data, authenticatedUser);
          } else if (path.match(/^\/\d+\/execute$/)) {
            const id = parseInt(path.split('/')[1]);
            // SỬA ĐỔI
            return await this.handleExecuteWorkflow(id, data, authenticatedUser);
          } else if (path.match(/^\/\d+\/execute-group$/)) {
            const id = parseInt(path.split('/')[1]);
            // SỬA ĐỔI
            return await this.handleExecuteWorkflowWithGroup(id, data, authenticatedUser);
          } else if (path.match(/^\/\d+\/duplicate$/)) {
            const id = parseInt(path.split('/')[1]);
            // SỬA ĐỔI
            return await this.handleDuplicateWorkflow(id, data, authenticatedUser);
          } else {
            throw new Error(`Unknown POST route: ${path}`);
          }
          
        case 'PUT':
          if (path.match(/^\/\d+$/)) {
            const id = parseInt(path.substring(1));
            // SỬA ĐỔI
            return await this.handleUpdateWorkflow(id, data, authenticatedUser);
          } else {
            throw new Error(`Unknown PUT route: ${path}`);
          }
          
        case 'DELETE':
          if (path.match(/^\/\d+$/)) {
            const id = parseInt(path.substring(1));
            // SỬA ĐỔI
            return await this.handleDeleteWorkflow(id, authenticatedUser);
          } else {
            throw new Error(`Unknown DELETE route: ${path}`);
          }
          
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      console.error('WorkflowController.handleRequest error:', error);
      throw error;
    }
  }

  // Embedded handlers that call business logic directly
  private static async handleGetAllWorkflows(authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const ownerId = parseInt(authenticatedUser.id);
      
      const workflowList = await WorkflowService.getAllWorkflowsByUserId(ownerId);
      
      return workflowList;
    } catch (error) {
      console.error('Error getting workflows:', error);
      if ((error as Error).message === 'User not authenticated') {
        throw new Error('User not authenticated');
      }
      throw new Error('Internal server error');
    }
  }

  private static async handleGetWorkflowById(id: number, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {

      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const ownerId = parseInt(authenticatedUser.id);
      
      const apiWorkflow = await WorkflowService.getWorkflowByIdAndOwner(id, ownerId);

      return apiWorkflow;
    } catch (error) {
      console.error('Error getting workflow by ID:', error);
      if ((error as Error).message === 'User not authenticated') {
        throw new Error('User not authenticated');
      }
      if ((error as Error).message === 'Workflow ID is required') {
        throw new Error('Workflow ID is required');
      }
      if ((error as Error).message === 'Workflow not found or access denied') {
        throw new Error('Workflow not found or access denied');
      }
      throw new Error('Failed to load workflow for editing');
    }
  }

  private static async handleCreateWorkflow(data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {

      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const ownerId = parseInt(authenticatedUser.id);
      
      const apiWorkflow = await WorkflowService.createWorkflow(data, ownerId);
      
      return apiWorkflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      if ((error as Error).message === 'User not authenticated') {
        throw new Error('User not authenticated');
      }
      if ((error as Error).message.includes('Invalid input data')) {
        throw new Error(`Invalid input data: ${(error as Error).message}`);
      }
      if ((error as Error).message === 'Failed to create workflow') {
        throw new Error('Failed to create workflow');
      }
      throw new Error('Internal server error');
    }
  }

  private static async handleUpdateWorkflow(id: number, data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const ownerId = parseInt(authenticatedUser.id);
      
      const apiWorkflow = await WorkflowService.updateWorkflow(id, data, ownerId);
      
      return apiWorkflow;
    } catch (error) {
      console.error('Error updating workflow:', error);
      if ((error as Error).message === 'User not authenticated') {
        throw new Error('User not authenticated');
      }
      if ((error as Error).message === 'Workflow ID is required') {
        throw new Error('Workflow ID is required');
      }
      if ((error as Error).message === 'Workflow not found or access denied') {
        throw new Error('Workflow not found or access denied');
      }
      if ((error as Error).message.includes('Invalid input data')) {
        throw new Error(`Invalid input data: ${(error as Error).message}`);
      }
      if ((error as Error).message === 'Failed to update workflow') {
        throw new Error('Failed to update workflow');
      }
      throw new Error('Internal server error');
    }
  }

  private static async handleDeleteWorkflow(id: number, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const ownerId = parseInt(authenticatedUser.id);
      
      await WorkflowService.deleteWorkflow(id, ownerId);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting workflow:', error);
      if ((error as Error).message === 'User not authenticated') {
        throw new Error('User not authenticated');
      }
      if ((error as Error).message === 'Workflow ID is required') {
        throw new Error('Workflow ID is required');
      }
      if ((error as Error).message === 'Workflow not found or access denied') {
        throw new Error('Workflow not found or access denied');
      }
      if ((error as Error).message === 'Failed to delete workflow') {
        throw new Error('Failed to delete workflow');
      }
      throw new Error('Internal server error');
    }
  }

  

  private static async handleDuplicateWorkflow(id: number, data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      // const { newName } = data; // BỎ DÒNG NÀY, VÌ FRONTEND KHÔNG GỬI BODY
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const ownerId = parseInt(authenticatedUser.id)
      
      // SỬA ĐỔI: Không truyền newName nữa
      const duplicatedWorkflow = await WorkflowService.duplicateWorkflow(id, ownerId);
      
      return duplicatedWorkflow;
    } catch (error) {
      console.error('Error duplicating workflow:', error);
      // ... (phần xử lý lỗi còn lại giữ nguyên)
      if ((error as Error).message.includes('Failed to create a duplicate')) {
        throw new Error('Failed to duplicate workflow');
      }
      throw new Error('Internal server error');
    }
  }

  private static async handleExportWorkflow(id: number, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const ownerId = parseInt(authenticatedUser.id);
      
      const exportData = await WorkflowService.exportWorkflow(id, ownerId);
      
      return exportData;
    } catch (error) {
      console.error('Error exporting workflow:', error);
      if ((error as Error).message === 'User not authenticated') {
        throw new Error('User not authenticated');
      }
      if ((error as Error).message === 'Workflow ID is required') {
        throw new Error('Workflow ID is required');
      }
      if ((error as Error).message === 'Workflow not found or access denied') {
        throw new Error('Workflow not found or access denied');
      }
      throw new Error('Internal server error');
    }
  }

  private static async handleImportWorkflow(data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const ownerId = parseInt(authenticatedUser.id);
      
      const importedWorkflow = await WorkflowService.importWorkflow(data, ownerId);
      
      return importedWorkflow;
    } catch (error) {
      console.error('Error importing workflow:', error);
      if ((error as Error).message === 'User not authenticated') {
        throw new Error('User not authenticated');
      }
      if ((error as Error).message === 'Invalid import data') {
        throw new Error('Invalid import data');
      }
      if ((error as Error).message === 'Failed to import workflow') {
        throw new Error('Failed to import workflow');
      }
      throw new Error('Internal server error');
    }
  }

  private static async handleExecuteWorkflow(id: number, data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const ownerId = parseInt(authenticatedUser.id);
      if (!ownerId) {
        throw new Error('User not authenticated');
      }

      const { profileIds, threads = 1 } = data;
      if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
        throw new Error('Profile IDs are required and must be a non-empty array');
      }

      // Import WorkflowExecutionService at runtime to avoid circular dependency
      const { WorkflowExecutionService } = await import('../services/workflow.execution.service');
      const result = await WorkflowExecutionService.executeWorkflow(id, ownerId, { profileIds, threads });

      return {
        success: true,
        data: result,
        message: 'Workflow execution started successfully'
      };
    } catch (error) {
      console.error('Execute workflow error:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private static async handleExecuteWorkflowWithGroup(id: number, data: any, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const ownerId = parseInt(authenticatedUser.id);

      const { groupId, profileIds, threads = 1 } = data;
      if (!groupId && (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0)) {
        throw new Error('Either groupId or profileIds must be provided');
      }

      // Import WorkflowExecutionService at runtime to avoid circular dependency
      const { WorkflowExecutionService } = await import('../services/workflow.execution.service');
      const result = await WorkflowExecutionService.executeWorkflowWithGroup(id, ownerId, { groupId, profileIds, threads });

      return {
        success: true,
        data: result,
        message: 'Workflow execution with group started successfully'
      };
    } catch (error) {
      console.error('Execute workflow with group error:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private static async handleGetExecutionsByWorkflow(id: number, authenticatedUser: AuthenticatedUser | null): Promise<any> {
    try {
      if (!authenticatedUser || !authenticatedUser.id) {
        throw new Error('User not authenticated');
      }
      const ownerId = parseInt(authenticatedUser.id);

      if (!id || isNaN(id)) {
        throw new Error('Invalid workflow ID');
      }

      // Import WorkflowExecutionService at runtime to avoid circular dependency
      const { WorkflowExecutionService } = await import('../services/workflow.execution.service');
      const result = await WorkflowExecutionService.getExecutionsByWorkflow(id, ownerId);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Get executions error:', error);
      throw new Error(error instanceof Error ? error.message : 'Internal server error');
    }
  }
}
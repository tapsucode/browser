"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionController = void 0;
const workflow_execution_service_1 = require("../services/workflow.execution.service");
class WorkflowExecutionController {
    /**
     * Handle requests from main.js routing for /api/workflows/execution/*
     * Parse method and URL to call appropriate method
     */
    static async handleRequest(method, url, data, headers = {}, authenticatedUser = null) {
        try {
            const urlParts = url.split('/').filter(part => part !== '');
            const path = '/' + urlParts.slice(3).join('/');
            switch (method) {
                case 'GET':
                    if (path === '/') {
                        // SỬA ĐỔI
                        return await this.handleGetAllExecutionsForUser(authenticatedUser);
                    }
                    else if (path === '/stats') {
                        // SỬA ĐỔI
                        return await this.handleGetExecutionStats(authenticatedUser);
                    }
                    else if (path.match(/^\/\d+$/)) {
                        const executionId = parseInt(path.substring(1));
                        // SỬA ĐỔI
                        return await this.handleGetExecutionById(executionId, authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown GET route: ${path}`);
                    }
                case 'POST':
                    if (path.match(/^\/\d+\/stop$/)) {
                        const executionId = parseInt(path.split('/')[1]);
                        // SỬA ĐỔI
                        return await this.handleStopExecution(executionId, authenticatedUser);
                    }
                    else if (path === '/batch') {
                        // SỬA ĐỔI
                        return await this.handleBatchDeleteExecutions(data, authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown POST route: ${path}`);
                    }
                case 'DELETE':
                    if (path.match(/^\/\d+$/)) {
                        const executionId = parseInt(path.substring(1));
                        // SỬA ĐỔI
                        return await this.handleDeleteExecution(executionId, authenticatedUser);
                    }
                    else if (path === '/batch') {
                        // SỬA ĐỔI
                        return await this.handleBatchDeleteExecutions(data, authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown DELETE route: ${path}`);
                    }
                default:
                    throw new Error(`Unknown method: ${method}`);
            }
        }
        catch (error) {
            console.error('WorkflowExecutionController.handleRequest error:', error);
            throw error;
        }
    }
    // Embedded handlers that call business logic directly
    static async handleStopExecution(executionId, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const userId = parseInt(authenticatedUser.id);
            if (!executionId) {
                throw new Error('Invalid execution ID');
            }
            const result = await workflow_execution_service_1.WorkflowExecutionService.stopExecution(executionId, userId);
            if (!result.success) {
                throw new Error(result.message || 'Failed to stop execution');
            }
            return result;
        }
        catch (error) {
            console.error('Stop execution error:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
    static async handleGetExecutionById(executionId, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const userId = parseInt(authenticatedUser.id);
            if (!executionId) {
                throw new Error('Invalid execution ID');
            }
            const result = await workflow_execution_service_1.WorkflowExecutionService.getExecutionById(executionId, userId);
            if (!result.success) {
                throw new Error(result.message || 'Execution not found');
            }
            return result;
        }
        catch (error) {
            console.error('Get execution by ID error:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
    static async handleGetExecutionsByWorkflow(workflowId, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const userId = parseInt(authenticatedUser.id);
            if (!workflowId) {
                throw new Error('Invalid workflow ID');
            }
            const result = await workflow_execution_service_1.WorkflowExecutionService.getExecutionsByWorkflow(workflowId, userId);
            return result;
        }
        catch (error) {
            console.error('Get executions by workflow error:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
    static async handleGetAllExecutionsForUser(authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const userId = parseInt(authenticatedUser.id);
            const result = await workflow_execution_service_1.WorkflowExecutionService.getAllExecutionsForUser(userId);
            return result;
        }
        catch (error) {
            console.error('Get all executions for user error:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
    static async handleDeleteExecution(executionId, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const userId = parseInt(authenticatedUser.id);
            if (!executionId) {
                throw new Error('Invalid execution ID');
            }
            const result = await workflow_execution_service_1.WorkflowExecutionService.deleteExecution(executionId, userId);
            if (!result) {
                throw new Error('Failed to delete execution');
            }
            return result;
        }
        catch (error) {
            console.error('Delete execution error:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
    static async handleBatchDeleteExecutions(data, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const userId = parseInt(authenticatedUser.id);
            const { executionIds } = data;
            if (!Array.isArray(executionIds) || executionIds.length === 0) {
                throw new Error('executionIds must be a non-empty array');
            }
            const result = await workflow_execution_service_1.WorkflowExecutionService.batchDeleteExecutions(executionIds, userId);
            return result;
        }
        catch (error) {
            console.error('Batch delete executions error:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
    static async handleGetExecutionStats(authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const userId = parseInt(authenticatedUser.id);
            const result = await workflow_execution_service_1.WorkflowExecutionService.getExecutionStats(userId);
            return result;
        }
        catch (error) {
            console.error('Get execution stats error:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
    static async handleExecuteWorkflow(data, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const userId = parseInt(authenticatedUser.id);
            const { workflowId, profileId, options = {} } = data;
            if (!workflowId || !profileId) {
                throw new Error('workflowId and profileId are required');
            }
            const result = await workflow_execution_service_1.WorkflowExecutionService.executeWorkflow(workflowId, userId, { profileId, options });
            return {
                success: true,
                executionId: result.id,
                message: 'Workflow execution started successfully'
            };
        }
        catch (error) {
            console.error('Execute workflow error:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
    static async handleExecuteWorkflowWithGroup(data, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const userId = parseInt(authenticatedUser.id);
            const { workflowId, groupId, concurrent = 1, options = {} } = data;
            if (!workflowId || !groupId) {
                throw new Error('workflowId and groupId are required');
            }
            const result = await workflow_execution_service_1.WorkflowExecutionService.executeWorkflowWithGroup(workflowId, userId, { groupId, concurrent, options });
            return {
                success: true,
                executionIds: [result.id],
                message: 'Workflow execution with group started successfully'
            };
        }
        catch (error) {
            console.error('Execute workflow with group error:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
}
exports.WorkflowExecutionController = WorkflowExecutionController;

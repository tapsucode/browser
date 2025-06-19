"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowController = void 0;
const workflow_service_1 = require("../services/workflow.service");
class WorkflowController {
    /**
     * Handle requests from main.js routing for /api/workflows/*
     * Parse method and URL to call appropriate method
     */
    static async handleRequest(method, url, data, headers = {}, authenticatedUser = null) {
        try {
            const urlParts = url.split('/').filter(part => part !== '');
            const path = '/' + urlParts.slice(2).join('/');
            switch (method) {
                case 'GET':
                    if (path === '/') {
                        // SỬA ĐỔI
                        return await this.handleGetAllWorkflows(authenticatedUser);
                    }
                    else if (path.match(/^\/\d+$/)) {
                        const id = parseInt(path.substring(1));
                        // SỬA ĐỔI
                        return await this.handleGetWorkflowById(id, authenticatedUser);
                    }
                    else if (path.match(/^\/\d+\/executions$/)) {
                        const id = parseInt(path.split('/')[1]);
                        // SỬA ĐỔI
                        return await this.handleGetExecutionsByWorkflow(id, authenticatedUser);
                    }
                    else if (path.match(/^\/\d+\/export$/)) {
                        const id = parseInt(path.split('/')[1]);
                        // SỬA ĐỔI
                        return await this.handleExportWorkflow(id, authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown GET route: ${path}`);
                    }
                case 'POST':
                    if (path === '/') {
                        // SỬA ĐỔI
                        return await this.handleCreateWorkflow(data, authenticatedUser);
                    }
                    else if (path === '/import') {
                        // SỬA ĐỔI
                        return await this.handleImportWorkflow(data, authenticatedUser);
                    }
                    else if (path.match(/^\/\d+\/execute$/)) {
                        const id = parseInt(path.split('/')[1]);
                        // SỬA ĐỔI
                        return await this.handleExecuteWorkflow(id, data, authenticatedUser);
                    }
                    else if (path.match(/^\/\d+\/execute-group$/)) {
                        const id = parseInt(path.split('/')[1]);
                        // SỬA ĐỔI
                        return await this.handleExecuteWorkflowWithGroup(id, data, authenticatedUser);
                    }
                    else if (path.match(/^\/\d+\/duplicate$/)) {
                        const id = parseInt(path.split('/')[1]);
                        // SỬA ĐỔI
                        return await this.handleDuplicateWorkflow(id, data, authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown POST route: ${path}`);
                    }
                case 'PUT':
                    if (path.match(/^\/\d+$/)) {
                        const id = parseInt(path.substring(1));
                        // SỬA ĐỔI
                        return await this.handleUpdateWorkflow(id, data, authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown PUT route: ${path}`);
                    }
                case 'DELETE':
                    if (path.match(/^\/\d+$/)) {
                        const id = parseInt(path.substring(1));
                        // SỬA ĐỔI
                        return await this.handleDeleteWorkflow(id, authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown DELETE route: ${path}`);
                    }
                default:
                    throw new Error(`Unknown method: ${method}`);
            }
        }
        catch (error) {
            console.error('WorkflowController.handleRequest error:', error);
            throw error;
        }
    }
    // Embedded handlers that call business logic directly
    static async handleGetAllWorkflows(authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const ownerId = parseInt(authenticatedUser.id);
            const workflowList = await workflow_service_1.WorkflowService.getAllWorkflowsByUserId(ownerId);
            return workflowList;
        }
        catch (error) {
            console.error('Error getting workflows:', error);
            if (error.message === 'User not authenticated') {
                throw new Error('User not authenticated');
            }
            throw new Error('Internal server error');
        }
    }
    static async handleGetWorkflowById(id, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const ownerId = parseInt(authenticatedUser.id);
            const apiWorkflow = await workflow_service_1.WorkflowService.getWorkflowByIdAndOwner(id, ownerId);
            return apiWorkflow;
        }
        catch (error) {
            console.error('Error getting workflow by ID:', error);
            if (error.message === 'User not authenticated') {
                throw new Error('User not authenticated');
            }
            if (error.message === 'Workflow ID is required') {
                throw new Error('Workflow ID is required');
            }
            if (error.message === 'Workflow not found or access denied') {
                throw new Error('Workflow not found or access denied');
            }
            throw new Error('Failed to load workflow for editing');
        }
    }
    static async handleCreateWorkflow(data, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const ownerId = parseInt(authenticatedUser.id);
            const apiWorkflow = await workflow_service_1.WorkflowService.createWorkflow(data, ownerId);
            return apiWorkflow;
        }
        catch (error) {
            console.error('Error creating workflow:', error);
            if (error.message === 'User not authenticated') {
                throw new Error('User not authenticated');
            }
            if (error.message.includes('Invalid input data')) {
                throw new Error(`Invalid input data: ${error.message}`);
            }
            if (error.message === 'Failed to create workflow') {
                throw new Error('Failed to create workflow');
            }
            throw new Error('Internal server error');
        }
    }
    static async handleUpdateWorkflow(id, data, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const ownerId = parseInt(authenticatedUser.id);
            const apiWorkflow = await workflow_service_1.WorkflowService.updateWorkflow(id, data, ownerId);
            return apiWorkflow;
        }
        catch (error) {
            console.error('Error updating workflow:', error);
            if (error.message === 'User not authenticated') {
                throw new Error('User not authenticated');
            }
            if (error.message === 'Workflow ID is required') {
                throw new Error('Workflow ID is required');
            }
            if (error.message === 'Workflow not found or access denied') {
                throw new Error('Workflow not found or access denied');
            }
            if (error.message.includes('Invalid input data')) {
                throw new Error(`Invalid input data: ${error.message}`);
            }
            if (error.message === 'Failed to update workflow') {
                throw new Error('Failed to update workflow');
            }
            throw new Error('Internal server error');
        }
    }
    static async handleDeleteWorkflow(id, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const ownerId = parseInt(authenticatedUser.id);
            await workflow_service_1.WorkflowService.deleteWorkflow(id, ownerId);
            return { success: true };
        }
        catch (error) {
            console.error('Error deleting workflow:', error);
            if (error.message === 'User not authenticated') {
                throw new Error('User not authenticated');
            }
            if (error.message === 'Workflow ID is required') {
                throw new Error('Workflow ID is required');
            }
            if (error.message === 'Workflow not found or access denied') {
                throw new Error('Workflow not found or access denied');
            }
            if (error.message === 'Failed to delete workflow') {
                throw new Error('Failed to delete workflow');
            }
            throw new Error('Internal server error');
        }
    }
    static async handleDuplicateWorkflow(id, data, authenticatedUser) {
        try {
            // const { newName } = data; // BỎ DÒNG NÀY, VÌ FRONTEND KHÔNG GỬI BODY
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const ownerId = parseInt(authenticatedUser.id);
            // SỬA ĐỔI: Không truyền newName nữa
            const duplicatedWorkflow = await workflow_service_1.WorkflowService.duplicateWorkflow(id, ownerId);
            return duplicatedWorkflow;
        }
        catch (error) {
            console.error('Error duplicating workflow:', error);
            // ... (phần xử lý lỗi còn lại giữ nguyên)
            if (error.message.includes('Failed to create a duplicate')) {
                throw new Error('Failed to duplicate workflow');
            }
            throw new Error('Internal server error');
        }
    }
    static async handleExportWorkflow(id, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const ownerId = parseInt(authenticatedUser.id);
            const exportData = await workflow_service_1.WorkflowService.exportWorkflow(id, ownerId);
            return exportData;
        }
        catch (error) {
            console.error('Error exporting workflow:', error);
            if (error.message === 'User not authenticated') {
                throw new Error('User not authenticated');
            }
            if (error.message === 'Workflow ID is required') {
                throw new Error('Workflow ID is required');
            }
            if (error.message === 'Workflow not found or access denied') {
                throw new Error('Workflow not found or access denied');
            }
            throw new Error('Internal server error');
        }
    }
    static async handleImportWorkflow(data, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const ownerId = parseInt(authenticatedUser.id);
            const importedWorkflow = await workflow_service_1.WorkflowService.importWorkflow(data, ownerId);
            return importedWorkflow;
        }
        catch (error) {
            console.error('Error importing workflow:', error);
            if (error.message === 'User not authenticated') {
                throw new Error('User not authenticated');
            }
            if (error.message === 'Invalid import data') {
                throw new Error('Invalid import data');
            }
            if (error.message === 'Failed to import workflow') {
                throw new Error('Failed to import workflow');
            }
            throw new Error('Internal server error');
        }
    }
    static async handleExecuteWorkflow(id, data, authenticatedUser) {
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
            const { WorkflowExecutionService } = await Promise.resolve().then(() => __importStar(require('../services/workflow.execution.service')));
            const result = await WorkflowExecutionService.executeWorkflow(id, ownerId, { profileIds, threads });
            return {
                success: true,
                data: result,
                message: 'Workflow execution started successfully'
            };
        }
        catch (error) {
            console.error('Execute workflow error:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
    static async handleExecuteWorkflowWithGroup(id, data, authenticatedUser) {
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
            const { WorkflowExecutionService } = await Promise.resolve().then(() => __importStar(require('../services/workflow.execution.service')));
            const result = await WorkflowExecutionService.executeWorkflowWithGroup(id, ownerId, { groupId, profileIds, threads });
            return {
                success: true,
                data: result,
                message: 'Workflow execution with group started successfully'
            };
        }
        catch (error) {
            console.error('Execute workflow with group error:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
    static async handleGetExecutionsByWorkflow(id, authenticatedUser) {
        try {
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const ownerId = parseInt(authenticatedUser.id);
            if (!id || isNaN(id)) {
                throw new Error('Invalid workflow ID');
            }
            // Import WorkflowExecutionService at runtime to avoid circular dependency
            const { WorkflowExecutionService } = await Promise.resolve().then(() => __importStar(require('../services/workflow.execution.service')));
            const result = await WorkflowExecutionService.getExecutionsByWorkflow(id, ownerId);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            console.error('Get executions error:', error);
            throw new Error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
}
exports.WorkflowController = WorkflowController;

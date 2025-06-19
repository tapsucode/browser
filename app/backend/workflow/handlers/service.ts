// File: final/workflow/handlers/service.ts

import { ExecutionContext, NodeHandler } from '../types';

export const serviceHandler: NodeHandler = async (context: ExecutionContext, params: Record<string, any>, nodeId: string): Promise<ExecutionContext> => {
  const { variables } = context;
  
  switch (nodeId) {
    case 'httpRequest':
    case 'apiCall':
      try {
        const url = params.url || variables[params.urlVariable];
        const method = params.method || 'GET';
        const headers = params.headers || {};
        const body = params.body || variables[params.bodyVariable];
        
        context.log.push({
          timestamp: new Date(),
          level: 'info',
          message: `Making ${method} request to: ${url}`,
          nodeId
        });
        
        // Simulate API call (in real implementation, use fetch or axios)
        const response = {
          status: 200,
          data: { success: true, timestamp: new Date().toISOString() },
          headers: { 'content-type': 'application/json' }
        };
        
        // Store response in variables
        if (params.responseVariable) {
          variables[params.responseVariable] = response.data;
        }
        if (params.statusVariable) {
          variables[params.statusVariable] = response.status;
        }
        
        context.log.push({
          timestamp: new Date(),
          level: 'info',
          message: `API call completed with status: ${response.status}`,
          nodeId
        });
        
      } catch (error) {
        context.log.push({
          timestamp: new Date(),
          level: 'error',
          message: `API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          nodeId
        });
        
        if (params.errorVariable) {
          variables[params.errorVariable] = error instanceof Error ? error.message : 'Unknown error';
        }
      }
      break;
      
    case 'webhook':
      try {
        const webhookUrl = params.webhookUrl || variables[params.webhookUrlVariable];
        const payload = params.payload || variables[params.payloadVariable] || {};
        
        context.log.push({
          timestamp: new Date(),
          level: 'info',
          message: `Sending webhook to: ${webhookUrl}`,
          nodeId
        });
        
        // Simulate webhook call
        const webhookResponse = {
          success: true,
          timestamp: new Date().toISOString(),
          payload
        };
        
        if (params.responseVariable) {
          variables[params.responseVariable] = webhookResponse;
        }
        
        context.log.push({
          timestamp: new Date(),
          level: 'info',
          message: 'Webhook sent successfully',
          nodeId
        });
        
      } catch (error) {
        context.log.push({
          timestamp: new Date(),
          level: 'error',
          message: `Webhook failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          nodeId
        });
      }
      break;
      
    case 'database':
      try {
        const operation = params.operation || 'SELECT';
        const query = params.query || variables[params.queryVariable];
        
        context.log.push({
          timestamp: new Date(),
          level: 'info',
          message: `Executing database ${operation}: ${query}`,
          nodeId
        });
        
        // Simulate database operation
        const dbResult = {
          operation,
          affectedRows: operation.toUpperCase() === 'SELECT' ? 0 : 1,
          data: operation.toUpperCase() === 'SELECT' ? [] : null,
          timestamp: new Date().toISOString()
        };
        
        if (params.resultVariable) {
          variables[params.resultVariable] = dbResult;
        }
        
        context.log.push({
          timestamp: new Date(),
          level: 'info',
          message: `Database operation completed`,
          nodeId
        });
        
      } catch (error) {
        context.log.push({
          timestamp: new Date(),
          level: 'error',
          message: `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          nodeId
        });
      }
      break;
      
    case 'email':
      try {
        const to = params.to || variables[params.toVariable];
        const subject = params.subject || variables[params.subjectVariable];
        const body = params.body || variables[params.bodyVariable];
        
        context.log.push({
          timestamp: new Date(),
          level: 'info',
          message: `Sending email to: ${to}, Subject: ${subject}`,
          nodeId
        });
        
        // Simulate email sending
        const emailResult = {
          success: true,
          messageId: `msg_${Date.now()}`,
          timestamp: new Date().toISOString()
        };
        
        if (params.resultVariable) {
          variables[params.resultVariable] = emailResult;
        }
        
        context.log.push({
          timestamp: new Date(),
          level: 'info',
          message: `Email sent successfully: ${emailResult.messageId}`,
          nodeId
        });
        
      } catch (error) {
        context.log.push({
          timestamp: new Date(),
          level: 'error',
          message: `Email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          nodeId
        });
      }
      break;
      
    default:
      context.log.push({
        timestamp: new Date(),
        level: 'warn',
        message: `Unhandled service node: ${nodeId}`,
        nodeId
      });
  }
  
  return context;
};
// File: final/workflow/handlers/trigger.ts

import { ExecutionContext, NodeHandler } from '../types';

export const triggerHandler: NodeHandler = async (context: ExecutionContext, params: Record<string, any>, nodeId: string): Promise<ExecutionContext> => {
  switch (nodeId) {
    case 'start':
      context.log.push({
        timestamp: new Date(),
        level: 'info',
        message: 'Workflow execution started'
      });
      break;
    default:
      context.log.push({
        timestamp: new Date(),
        level: 'warn',
        message: `Unhandled trigger node: ${nodeId}`
      });
  }
  return context;
};
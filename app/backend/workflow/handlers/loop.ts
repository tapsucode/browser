// File: final/workflow/handlers/loop.ts

import { ExecutionContext, NodeHandler } from '../types';

export const loopHandler: NodeHandler = async (context: ExecutionContext, params: Record<string, any>, nodeId: string): Promise<ExecutionContext> => {
  const { variables } = context;
  
  switch (nodeId) {
    case 'loop':
    case 'for':
      // Set loop configuration
      const iterations = params.iterations || params.count || 1;
      const loopVariable = params.loopVariable || 'i';
      
      variables[`${nodeId}_iterations`] = iterations;
      variables[`${nodeId}_current`] = 0;
      variables[loopVariable] = 0;
      
      context.log.push({
        timestamp: new Date(),
        level: 'info',
        message: `Loop ${nodeId} configured for ${iterations} iterations`,
        nodeId
      });
      break;
      
    case 'forEach':
      // Loop through array
      if (params.array && Array.isArray(variables[params.array])) {
        const array = variables[params.array];
        const itemVariable = params.itemVariable || 'item';
        const indexVariable = params.indexVariable || 'index';
        
        variables[`${nodeId}_array`] = array;
        variables[`${nodeId}_length`] = array.length;
        variables[`${nodeId}_current`] = 0;
        variables[itemVariable] = array[0];
        variables[indexVariable] = 0;
        
        context.log.push({
          timestamp: new Date(),
          level: 'info',
          message: `forEach loop configured for ${array.length} items`,
          nodeId
        });
      }
      break;
      
    case 'while':
      // While loop setup
      variables[`${nodeId}_condition`] = params.condition || 'true';
      variables[`${nodeId}_maxIterations`] = params.maxIterations || 100; // Safety limit
      variables[`${nodeId}_current`] = 0;
      
      context.log.push({
        timestamp: new Date(),
        level: 'info',
        message: `While loop configured with condition: ${params.condition}`,
        nodeId
      });
      break;
      
    case 'break':
      // Break out of loop
      variables[`${nodeId}_break`] = true;
      context.log.push({
        timestamp: new Date(),
        level: 'info',
        message: 'Loop break triggered',
        nodeId
      });
      break;
      
    case 'continue':
      // Continue to next iteration
      variables[`${nodeId}_continue`] = true;
      context.log.push({
        timestamp: new Date(),
        level: 'info',
        message: 'Loop continue triggered',
        nodeId
      });
      break;
      
    case 'repeat':
      // Simple repeat configuration
      const repeatCount = params.count || 1;
      variables[`${nodeId}_count`] = repeatCount;
      variables[`${nodeId}_current`] = 0;
      
      context.log.push({
        timestamp: new Date(),
        level: 'info',
        message: `Repeat configured for ${repeatCount} times`,
        nodeId
      });
      break;
      
    default:
      context.log.push({
        timestamp: new Date(),
        level: 'warn',
        message: `Unhandled loop node: ${nodeId}`,
        nodeId
      });
  }
  
  return context;
};
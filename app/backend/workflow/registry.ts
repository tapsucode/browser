// File: final/workflow/registry.ts

import { NodeHandler } from './types';
import { triggerHandler } from './handlers/trigger';
import { actionHandler } from './handlers/action';
import { conditionHandler } from './handlers/condition';
import { loopHandler } from './handlers/loop';
import { dataHandler } from './handlers/data';
import { waitHandler } from './handlers/wait';
import { serviceHandler } from './handlers/service';
import { outputHandler } from './handlers/output';

export interface NodeRegistry {
  [nodeType: string]: NodeHandler;
}

export const registry: NodeRegistry = {
  triggerNode: triggerHandler,
  actionNode: actionHandler,
  conditionNode: conditionHandler,
  loopNode: loopHandler,
  dataNode: dataHandler,
  waitNode: waitHandler,
  serviceNode: serviceHandler,
  outputNode: outputHandler
};

export class WorkflowRegistry {
  private static nodeHandlers: NodeRegistry = { ...registry };

  static getHandler(nodeType: string): NodeHandler | undefined {
    return this.nodeHandlers[nodeType];
  }

  static registerHandler(nodeType: string, handler: NodeHandler): void {
    this.nodeHandlers[nodeType] = handler;
  }

  static unregisterHandler(nodeType: string): void {
    delete this.nodeHandlers[nodeType];
  }

  static getAllHandlers(): NodeRegistry {
    return { ...this.nodeHandlers };
  }

  static hasHandler(nodeType: string): boolean {
    return nodeType in this.nodeHandlers;
  }
}
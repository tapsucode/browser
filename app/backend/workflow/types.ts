// File: final/workflow/types.ts

export interface WorkflowNode {
  id: string;
  type: string;
  parameters: Record<string, any>;
}

export interface WorkflowEdge {
  id?: string;
  from: string;
  to: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ExecutionContext {
  browserContext?: any;
  page?: any;
  variables: Record<string, any>;
  userId: number;
  profileId?: number;
  currentStep?: string;
  state?: any;
  resourceStatus?: any;
  progress: {
    completed: number;
    total: number;
    percentComplete: number;
  };
  stats: {
    successful: number;
    failed: number;
    skipped: number;
  };
  error?: string;
  log: Array<{
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    nodeId?: string;
  }>;
}

export interface NodeHandler {
  (context: ExecutionContext, params: Record<string, any>, nodeId: string): Promise<ExecutionContext>;
}

export interface WorkflowExecutionResult {
  success: boolean;
  context: ExecutionContext;
  error?: string;
  executionTime: number;
}

export interface WorkflowExecutionOptions {
  timeout?: number;
  maxRetries?: number;
  retryOnFail?: boolean;
  headless?: boolean;
  waitUntil?: 'load' | 'networkidle';
}
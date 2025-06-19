// File: final/workflow/parser.ts

export interface WorkflowNode {
  id: string;
  type: string;
  data:{
    nodeId: string; // Unique identifier for the node
    label: string; // Display label for the node
    description?: string; // Optional description for the node
    parameters: Record<string, any>;
  } 
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

export interface ParsedWorkflow {
  nodesMap: Map<string, WorkflowNode>;
  adjList: Map<string, Array<{ to: string; edgeId?: string }>>;
}

/**
 * Parse raw JSON workflow into internal graph representation
 */
export function parseWorkflow({ nodes, edges }: WorkflowDefinition): ParsedWorkflow {
  const nodesMap = new Map<string, WorkflowNode>();
  const adjList = new Map<string, Array<{ to: string; edgeId?: string }>>();

  // Initialize maps
  for (const node of nodes) {
    nodesMap.set(node.id, node);
    adjList.set(node.id, []);
  }

  // Build adjacency list
  for (const edge of edges) {
    if (!nodesMap.has(edge.from) || !nodesMap.has(edge.to)) {
      throw new Error(`Invalid edge reference: ${edge.from} -> ${edge.to}`);
    }
    adjList.get(edge.from)!.push({ to: edge.to, edgeId: edge.id });
  }

  return { nodesMap, adjList };
}

/**
 * Topological sort on the directed graph
 */
export function topoSort(nodesMap: Map<string, WorkflowNode>, adjList: Map<string, Array<{ to: string; edgeId?: string }>>): string[] {
  // Compute in-degree for each node
  const inDegree = new Map<string, number>();
  for (const id of nodesMap.keys()) {
    inDegree.set(id, 0);
  }
  for (const [from, outs] of adjList.entries()) {
    for (const { to } of outs) {
      inDegree.set(to, (inDegree.get(to) || 0) + 1);
    }
  }

  // Collect nodes with in-degree 0
  const queue: string[] = [];
  for (const [id, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    sorted.push(id);

    for (const { to } of adjList.get(id)!) {
      const newDeg = inDegree.get(to)! - 1;
      inDegree.set(to, newDeg);
      if (newDeg === 0) queue.push(to);
    }
  }

  if (sorted.length !== nodesMap.size) {
    throw new Error('Cycle detected in workflow graph');
  }
  return sorted;
}

export class WorkflowParser {
  static parse(workflowDefinition: WorkflowDefinition): ParsedWorkflow {
    return parseWorkflow(workflowDefinition);
  }

  static sortTopologically(nodesMap: Map<string, WorkflowNode>, adjList: Map<string, Array<{ to: string; edgeId?: string }>>): string[] {
    return topoSort(nodesMap, adjList);
  }

  static validateWorkflow(workflowDefinition: WorkflowDefinition): boolean {
    try {
      const { nodesMap, adjList } = this.parse(workflowDefinition);
      this.sortTopologically(nodesMap, adjList);
      return true;
    } catch (error) {
      return false;
    }
  }
}
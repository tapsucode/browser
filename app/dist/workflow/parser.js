"use strict";
// File: final/workflow/parser.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowParser = void 0;
exports.parseWorkflow = parseWorkflow;
exports.topoSort = topoSort;
/**
 * Parse raw JSON workflow into internal graph representation
 */
function parseWorkflow({ nodes, edges }) {
    const nodesMap = new Map();
    const adjList = new Map();
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
        adjList.get(edge.from).push({ to: edge.to, edgeId: edge.id });
    }
    return { nodesMap, adjList };
}
/**
 * Topological sort on the directed graph
 */
function topoSort(nodesMap, adjList) {
    // Compute in-degree for each node
    const inDegree = new Map();
    for (const id of nodesMap.keys()) {
        inDegree.set(id, 0);
    }
    for (const [from, outs] of adjList.entries()) {
        for (const { to } of outs) {
            inDegree.set(to, (inDegree.get(to) || 0) + 1);
        }
    }
    // Collect nodes with in-degree 0
    const queue = [];
    for (const [id, degree] of inDegree.entries()) {
        if (degree === 0)
            queue.push(id);
    }
    const sorted = [];
    while (queue.length > 0) {
        const id = queue.shift();
        sorted.push(id);
        for (const { to } of adjList.get(id)) {
            const newDeg = inDegree.get(to) - 1;
            inDegree.set(to, newDeg);
            if (newDeg === 0)
                queue.push(to);
        }
    }
    if (sorted.length !== nodesMap.size) {
        throw new Error('Cycle detected in workflow graph');
    }
    return sorted;
}
class WorkflowParser {
    static parse(workflowDefinition) {
        return parseWorkflow(workflowDefinition);
    }
    static sortTopologically(nodesMap, adjList) {
        return topoSort(nodesMap, adjList);
    }
    static validateWorkflow(workflowDefinition) {
        try {
            const { nodesMap, adjList } = this.parse(workflowDefinition);
            this.sortTopologically(nodesMap, adjList);
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.WorkflowParser = WorkflowParser;

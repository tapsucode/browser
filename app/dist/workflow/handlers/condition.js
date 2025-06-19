"use strict";
// File: final/workflow/handlers/condition.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.conditionHandler = void 0;
const conditionHandler = async (context, params, nodeId) => {
    const { variables } = context;
    try {
        let result = false;
        switch (nodeId) {
            case 'condition':
            case 'if':
                // Evaluate condition based on parameters
                if (params.condition) {
                    // Simple condition evaluation
                    if (typeof params.condition === 'string') {
                        // Handle string conditions like "variableName === 'value'"
                        result = evaluateCondition(params.condition, variables);
                    }
                    else if (typeof params.condition === 'boolean') {
                        result = params.condition;
                    }
                }
                break;
            case 'elementExists':
                if (context.page && params.selector) {
                    const element = await context.page.$(params.selector);
                    result = !!element;
                }
                break;
            case 'textContains':
                if (context.page && params.selector && params.text) {
                    const element = await context.page.$(params.selector);
                    if (element) {
                        const textContent = await element.textContent();
                        result = textContent?.includes(params.text) || false;
                    }
                }
                break;
            case 'urlContains':
                if (context.page && params.url) {
                    const currentUrl = context.page.url();
                    result = currentUrl.includes(params.url);
                }
                break;
            default:
                context.log.push({
                    timestamp: new Date(),
                    level: 'warn',
                    message: `Unhandled condition node: ${nodeId}`,
                    nodeId
                });
        }
        // Store result in variables
        variables[`${nodeId}_result`] = result;
        context.log.push({
            timestamp: new Date(),
            level: 'info',
            message: `Condition ${nodeId} evaluated to: ${result}`,
            nodeId
        });
    }
    catch (error) {
        context.log.push({
            timestamp: new Date(),
            level: 'error',
            message: `Error evaluating condition ${nodeId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            nodeId
        });
        variables[`${nodeId}_result`] = false;
    }
    return context;
};
exports.conditionHandler = conditionHandler;
// Simple condition evaluation helper
function evaluateCondition(condition, variables) {
    try {
        // Replace variable references in condition string
        let evaluableCondition = condition;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            evaluableCondition = evaluableCondition.replace(regex, JSON.stringify(value));
        }
        // Simple evaluation for basic conditions
        // Note: In production, use a safer expression evaluator
        return Function('"use strict"; return (' + evaluableCondition + ')')();
    }
    catch (error) {
        console.warn('Failed to evaluate condition:', condition, error);
        return false;
    }
}

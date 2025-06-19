"use strict";
// File: final/workflow/handlers/wait.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitHandler = void 0;
const waitHandler = async (context, params, nodeId) => {
    switch (nodeId) {
        case 'wait':
        case 'delay':
            const waitTime = params.duration || params.time || 1000; // Default 1 second
            context.log.push({
                timestamp: new Date(),
                level: 'info',
                message: `Waiting for ${waitTime}ms`,
                nodeId
            });
            await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 30000))); // Max 30 seconds
            break;
        case 'waitForElement':
            if (context.page && params.selector) {
                const timeout = params.timeout || 10000; // Default 10 seconds
                context.log.push({
                    timestamp: new Date(),
                    level: 'info',
                    message: `Waiting for element: ${params.selector}`,
                    nodeId
                });
                try {
                    await context.page.waitForSelector(params.selector, { timeout });
                    context.log.push({
                        timestamp: new Date(),
                        level: 'info',
                        message: `Element found: ${params.selector}`,
                        nodeId
                    });
                }
                catch (error) {
                    context.log.push({
                        timestamp: new Date(),
                        level: 'error',
                        message: `Element not found within timeout: ${params.selector}`,
                        nodeId
                    });
                }
            }
            break;
        case 'waitForUrl':
            if (context.page && params.url) {
                const timeout = params.timeout || 10000;
                context.log.push({
                    timestamp: new Date(),
                    level: 'info',
                    message: `Waiting for URL to contain: ${params.url}`,
                    nodeId
                });
                try {
                    await context.page.waitForURL(params.url, { timeout });
                    context.log.push({
                        timestamp: new Date(),
                        level: 'info',
                        message: `URL matched: ${params.url}`,
                        nodeId
                    });
                }
                catch (error) {
                    context.log.push({
                        timestamp: new Date(),
                        level: 'error',
                        message: `URL not matched within timeout: ${params.url}`,
                        nodeId
                    });
                }
            }
            break;
        case 'waitForText':
            if (context.page && params.text) {
                const timeout = params.timeout || 10000;
                const selector = params.selector || 'body';
                context.log.push({
                    timestamp: new Date(),
                    level: 'info',
                    message: `Waiting for text "${params.text}" in ${selector}`,
                    nodeId
                });
                try {
                    await context.page.waitForFunction(({ selector, text }) => {
                        const element = document.querySelector(selector);
                        return element && element.textContent?.includes(text);
                    }, { selector, text: params.text }, { timeout });
                    context.log.push({
                        timestamp: new Date(),
                        level: 'info',
                        message: `Text found: "${params.text}"`,
                        nodeId
                    });
                }
                catch (error) {
                    context.log.push({
                        timestamp: new Date(),
                        level: 'error',
                        message: `Text not found within timeout: "${params.text}"`,
                        nodeId
                    });
                }
            }
            break;
        case 'waitForCondition':
            if (params.condition) {
                const timeout = params.timeout || 10000;
                const checkInterval = params.checkInterval || 500;
                context.log.push({
                    timestamp: new Date(),
                    level: 'info',
                    message: `Waiting for condition: ${params.condition}`,
                    nodeId
                });
                const startTime = Date.now();
                while (Date.now() - startTime < timeout) {
                    try {
                        // Simple condition evaluation
                        const conditionMet = evaluateCondition(params.condition, context.variables);
                        if (conditionMet) {
                            context.log.push({
                                timestamp: new Date(),
                                level: 'info',
                                message: `Condition met: ${params.condition}`,
                                nodeId
                            });
                            break;
                        }
                    }
                    catch (error) {
                        context.log.push({
                            timestamp: new Date(),
                            level: 'error',
                            message: `Error evaluating condition: ${error instanceof Error ? error.message : 'Unknown error'}`,
                            nodeId
                        });
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, checkInterval));
                }
            }
            break;
        default:
            context.log.push({
                timestamp: new Date(),
                level: 'warn',
                message: `Unhandled wait node: ${nodeId}`,
                nodeId
            });
    }
    return context;
};
exports.waitHandler = waitHandler;
// Simple condition evaluation helper
function evaluateCondition(condition, variables) {
    try {
        let evaluableCondition = condition;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            evaluableCondition = evaluableCondition.replace(regex, JSON.stringify(value));
        }
        return Function('"use strict"; return (' + evaluableCondition + ')')();
    }
    catch (error) {
        return false;
    }
}

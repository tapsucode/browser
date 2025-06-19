"use strict";
// File: final/workflow/handlers/data.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataHandler = void 0;
const dataHandler = async (context, params, nodeId) => {
    const { variables } = context;
    switch (nodeId) {
        case 'setVariable':
            if (params.variableName && params.value !== undefined) {
                variables[params.variableName] = params.value;
                context.log.push({
                    timestamp: new Date(),
                    level: 'info',
                    message: `Set variable ${params.variableName} = ${params.value}`,
                    nodeId
                });
            }
            break;
        case 'getData':
            // Extract data from page element
            if (context.page && params.selector && params.variableName) {
                try {
                    const element = await context.page.$(params.selector);
                    if (element) {
                        let value;
                        if (params.attribute) {
                            value = await element.getAttribute(params.attribute);
                        }
                        else {
                            value = await element.textContent();
                        }
                        variables[params.variableName] = value;
                        context.log.push({
                            timestamp: new Date(),
                            level: 'info',
                            message: `Extracted data: ${params.variableName} = ${value}`,
                            nodeId
                        });
                    }
                }
                catch (error) {
                    context.log.push({
                        timestamp: new Date(),
                        level: 'error',
                        message: `Failed to extract data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        nodeId
                    });
                }
            }
            break;
        case 'transformData':
            // Transform existing variable data
            if (params.sourceVariable && params.targetVariable && variables[params.sourceVariable] !== undefined) {
                let transformedValue = variables[params.sourceVariable];
                if (params.transformation) {
                    switch (params.transformation) {
                        case 'uppercase':
                            transformedValue = String(transformedValue).toUpperCase();
                            break;
                        case 'lowercase':
                            transformedValue = String(transformedValue).toLowerCase();
                            break;
                        case 'trim':
                            transformedValue = String(transformedValue).trim();
                            break;
                        case 'number':
                            transformedValue = Number(transformedValue);
                            break;
                        default:
                            context.log.push({
                                timestamp: new Date(),
                                level: 'warn',
                                message: `Unknown transformation: ${params.transformation}`,
                                nodeId
                            });
                    }
                }
                variables[params.targetVariable] = transformedValue;
                context.log.push({
                    timestamp: new Date(),
                    level: 'info',
                    message: `Transformed ${params.sourceVariable} to ${params.targetVariable}: ${transformedValue}`,
                    nodeId
                });
            }
            break;
        case 'processData':
            // Process data from parameters
            if (params.data && typeof params.data === 'object') {
                Object.assign(variables, params.data);
                context.log.push({
                    timestamp: new Date(),
                    level: 'info',
                    message: `Processed ${Object.keys(params.data).length} data variables`,
                    nodeId
                });
            }
            break;
        case 'generateData':
            // Generate data based on type
            if (params.variableName && params.type) {
                let generatedValue;
                switch (params.type) {
                    case 'timestamp':
                        generatedValue = new Date().toISOString();
                        break;
                    case 'uuid':
                        generatedValue = generateUUID();
                        break;
                    case 'random':
                        generatedValue = Math.random();
                        break;
                    case 'randomInt':
                        const min = params.min || 0;
                        const max = params.max || 100;
                        generatedValue = Math.floor(Math.random() * (max - min + 1)) + min;
                        break;
                    default:
                        generatedValue = null;
                }
                if (generatedValue !== null) {
                    variables[params.variableName] = generatedValue;
                    context.log.push({
                        timestamp: new Date(),
                        level: 'info',
                        message: `Generated ${params.type}: ${params.variableName} = ${generatedValue}`,
                        nodeId
                    });
                }
            }
            break;
        default:
            context.log.push({
                timestamp: new Date(),
                level: 'warn',
                message: `Unhandled data node: ${nodeId}`,
                nodeId
            });
    }
    return context;
};
exports.dataHandler = dataHandler;
// Simple UUID generator
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

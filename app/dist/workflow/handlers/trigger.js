"use strict";
// File: final/workflow/handlers/trigger.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerHandler = void 0;
const triggerHandler = async (context, params, nodeId) => {
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
exports.triggerHandler = triggerHandler;

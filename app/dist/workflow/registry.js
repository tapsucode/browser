"use strict";
// File: final/workflow/registry.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowRegistry = exports.registry = void 0;
const trigger_1 = require("./handlers/trigger");
const action_1 = require("./handlers/action");
const condition_1 = require("./handlers/condition");
const loop_1 = require("./handlers/loop");
const data_1 = require("./handlers/data");
const wait_1 = require("./handlers/wait");
const service_1 = require("./handlers/service");
const output_1 = require("./handlers/output");
exports.registry = {
    triggerNode: trigger_1.triggerHandler,
    actionNode: action_1.actionHandler,
    conditionNode: condition_1.conditionHandler,
    loopNode: loop_1.loopHandler,
    dataNode: data_1.dataHandler,
    waitNode: wait_1.waitHandler,
    serviceNode: service_1.serviceHandler,
    outputNode: output_1.outputHandler
};
class WorkflowRegistry {
    static getHandler(nodeType) {
        return this.nodeHandlers[nodeType];
    }
    static registerHandler(nodeType, handler) {
        this.nodeHandlers[nodeType] = handler;
    }
    static unregisterHandler(nodeType) {
        delete this.nodeHandlers[nodeType];
    }
    static getAllHandlers() {
        return { ...this.nodeHandlers };
    }
    static hasHandler(nodeType) {
        return nodeType in this.nodeHandlers;
    }
}
exports.WorkflowRegistry = WorkflowRegistry;
WorkflowRegistry.nodeHandlers = { ...exports.registry };

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workflow_controller_1 = require("../controllers/workflow.controller");
const workflow_execution_controller_1 = require("../controllers/workflow.execution.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJWT);
// Basic workflow CRUD operations
router.get("/", workflow_controller_1.WorkflowController.getAllWorkflows);
router.get("/:id", workflow_controller_1.WorkflowController.getWorkflowById);
router.post("/", workflow_controller_1.WorkflowController.createWorkflow);
router.put("/:id", workflow_controller_1.WorkflowController.updateWorkflow);
router.delete("/:id", workflow_controller_1.WorkflowController.deleteWorkflow);
// Workflow execution operations
router.post("/:id/execute", workflow_execution_controller_1.WorkflowExecutionController.executeWorkflow);
router.post("/:id/execute-group", workflow_execution_controller_1.WorkflowExecutionController.executeWorkflowWithGroup);
// Workflow execution management operations
router.post("/executions/:executionId/stop", workflow_execution_controller_1.WorkflowExecutionController.stopExecution);
router.get("/executions", workflow_execution_controller_1.WorkflowExecutionController.getAllExecutionsForUser);
router.get("/executions/:executionId", workflow_execution_controller_1.WorkflowExecutionController.getExecutionById);
router.get("/:id/executions", workflow_execution_controller_1.WorkflowExecutionController.getExecutionsByWorkflow);
router.delete("/executions/:executionId", workflow_execution_controller_1.WorkflowExecutionController.deleteExecution);
router.delete("/executions/batch", workflow_execution_controller_1.WorkflowExecutionController.batchDeleteExecutions);
router.get("/executions/stats", workflow_execution_controller_1.WorkflowExecutionController.getExecutionStats);
exports.default = router;

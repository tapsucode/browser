import { Router } from "express";
import { WorkflowController } from "../controllers/workflow.controller";
import { WorkflowExecutionController } from "../controllers/workflow.execution.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateJWT);

// Basic workflow CRUD operations
router.get("/", WorkflowController.getAllWorkflows);
router.get("/:id", WorkflowController.getWorkflowById);
router.post("/", WorkflowController.createWorkflow);
router.put("/:id", WorkflowController.updateWorkflow);
router.delete("/:id", WorkflowController.deleteWorkflow);

// Workflow execution operations
router.post("/:id/execute", WorkflowExecutionController.executeWorkflow);
router.post("/:id/execute-group", WorkflowExecutionController.executeWorkflowWithGroup);

// Workflow execution management operations
router.post(
  "/executions/:executionId/stop",
  WorkflowExecutionController.stopExecution,
);
router.get("/executions", WorkflowExecutionController.getAllExecutionsForUser);
router.get(
  "/executions/:executionId",
  WorkflowExecutionController.getExecutionById,
);
router.get(
  "/:id/executions",
  WorkflowExecutionController.getExecutionsByWorkflow,
);
router.delete(
  "/executions/:executionId",
  WorkflowExecutionController.deleteExecution,
);
router.delete(
  "/executions/batch",
  WorkflowExecutionController.batchDeleteExecutions,
);
router.get("/executions/stats", WorkflowExecutionController.getExecutionStats);

export default router;

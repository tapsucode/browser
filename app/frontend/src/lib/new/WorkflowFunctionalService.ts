import { ElectronAPIClient } from "../electron-api";
import {
  Workflow,
  WorkflowExecution,
  WorkflowExecutionParams,
  CreateWorkflowData,
  UpdateWorkflowData,
  // XÓA BỎ: không cần import WorkflowNode, WorkflowEdge ở đây nữa vì không dùng trong các hàm chuyển đổi
} from "../types";
import {
  logServiceError,
  handleArrayResponse,
  handleObjectResponse,
} from "../../utils/error-utils";

const SERVICE_NAME = "WorkflowFunctionalService";

// XÓA BỎ: Hàm này là nguồn gốc của vấn đề, logic đã được chuyển vào hook `use-workflow-editor`.
/*
export function convertToBackendFormat(clientWorkflow: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }) { ... }
*/

/**
 * SỬA ĐỔI: Chuyển đổi định dạng từ backend sang client (React Flow).
 * Hàm này bây giờ là "nguồn chân lý" duy nhất cho việc tải dữ liệu.
 */
export function convertToClientFormat(backendWorkflow: any) {
  console.log("🔍 DEBUG - convertToClientFormat input:", backendWorkflow);
  
  const result = {
    nodes:
      backendWorkflow.nodes?.map((node: any) => {
        // Backend chỉ có id, type, position, và data.
        const clientNode = {
          id: node.id,
          type: node.type,
          position: node.position || { x: 0, y: 0 },
          // Toàn bộ object `data` từ backend được giữ nguyên và gán vào `data` của client node.
          data: node.data || {},
        };
        console.log("🔍 DEBUG - Converted client node:", clientNode);
        return clientNode;
      }) || [],
    edges:
      backendWorkflow.edges?.map((edge: any) => ({
        id: edge.id,
        // Chuyển `from` -> `source` và `to` -> `target` cho React Flow
        source: edge.from,
        target: edge.to,
        type: edge.type || "default",
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        data: edge.data || {},
      })) || [],
  };
  console.log("🔍 DEBUG - convertToClientFormat result:", result);
  return result;
}

export const WorkflowFunctionalService = {

  async getWorkflows(): Promise<Workflow[]> {
    try {
      return await handleArrayResponse<Workflow>(
        ElectronAPIClient.request("GET", "/api/workflows"),
        SERVICE_NAME,
        "getWorkflows",
      );
    } catch (error) {
      logServiceError(SERVICE_NAME, "getWorkflows", error);
      return [];
    }
  },

  async getWorkflow(id: string): Promise<Workflow | null> {
    try {
      const response = await handleObjectResponse<any>(
        ElectronAPIClient.request("GET", `/api/workflows/${id}`),
        SERVICE_NAME,
        "getWorkflow",
        null,
      );
      console.log("🔍 DEBUG - Raw backend response:", response);

      if (response) {
        // SỬA ĐỔI: Luôn dùng `convertToClientFormat` để đảm bảo tính nhất quán
        // khi nhận dữ liệu có `workflowContent`.
        if (response.workflowContent) {
          console.log("🔍 DEBUG - Converting workflowContent:", response.workflowContent);
          const clientFormat = convertToClientFormat(response.workflowContent);
          return {
            ...response,
            nodes: clientFormat.nodes,
            edges: clientFormat.edges,
          };
        }
        
        // Fallback: nếu backend vì lý do nào đó trả về nodes/edges ở cấp cao nhất
        // thì vẫn giữ lại, nhưng đây không phải luồng chính.
        if (response.nodes && response.edges) {
          console.log("🔍 DEBUG - Response already has nodes/edges at top level");
          return response;
        }

        // Fallback cuối cùng: trả về response với nodes/edges rỗng
        return {
          ...response,
          nodes: [],
          edges: [],
        };
      }

      return response;
    } catch (error) {
      logServiceError(SERVICE_NAME, "getWorkflow", error);
      return null;
    }
  },

  async createWorkflow(
    workflowData: CreateWorkflowData,
  ): Promise<Workflow | null> {
    try {
      console.log("🔍 DEBUG - createWorkflow input:", workflowData);

      // SỬA ĐỔI: Đơn giản hóa logic.
      // Chúng ta tin tưởng rằng `workflowData.workflowContent` đã được định dạng đúng từ hook.
      // Không cần gọi `convertToBackendFormat` ở đây nữa.
      const backendData: any = {
        name: workflowData.name,
        description: workflowData.description,
        workflowContent: workflowData.workflowContent || { nodes: [], edges: [] },
      };

      console.log("🔍 DEBUG - Final backend data for create:", backendData);

      // Logic gửi request và xử lý response giữ nguyên, nhưng sẽ dùng `convertToClientFormat`
      const response = await handleObjectResponse<any>(
        ElectronAPIClient.request("POST", "/api/workflows", backendData),
        SERVICE_NAME,
        "createWorkflow",
        null,
      );

      console.log("🔍 DEBUG - Create response:", response);

      if (response) {
        if (response.workflowContent) {
          const clientFormat = convertToClientFormat(response.workflowContent);
          return {
            ...response,
            nodes: clientFormat.nodes,
            edges: clientFormat.edges,
          };
        }
        return { ...response, nodes: [], edges: [] };
      }

      return response;
    } catch (error) {
      logServiceError(SERVICE_NAME, "createWorkflow", error);
      return null;
    }
  },

  async updateWorkflow(
    id: string,
    workflowData: UpdateWorkflowData,
  ): Promise<Workflow | null> {
    try {
      console.log("🔍 DEBUG - updateWorkflow input:", { id, workflowData });

      // SỬA ĐỔI: Đơn giản hóa logic.
      // Tin tưởng `workflowData.workflowContent` đã được định dạng đúng từ hook.
      const backendData: any = {};
      if (workflowData.name) backendData.name = workflowData.name;
      if (workflowData.description !== undefined) backendData.description = workflowData.description;

      if (workflowData.workflowContent) {
        backendData.workflowContent = workflowData.workflowContent;
      }

      console.log("🔍 DEBUG - Final backend data for update:", backendData);

      // Logic gửi request và xử lý response giữ nguyên, nhưng sẽ dùng `convertToClientFormat`
      const response = await handleObjectResponse<any>(
        ElectronAPIClient.request("PUT", `/api/workflows/${id}`, backendData),
        SERVICE_NAME,
        "updateWorkflow",
        null,
      );

      console.log("🔍 DEBUG - Update response:", response);

      if (response) {
        if (response.workflowContent) {
          const clientFormat = convertToClientFormat(response.workflowContent);
          return {
            ...response,
            nodes: clientFormat.nodes,
            edges: clientFormat.edges,
          };
        }
        return { ...response, nodes: [], edges: [] };
      }

      return response;
    } catch (error) {
      logServiceError(SERVICE_NAME, "updateWorkflow", error);
      return null;
    }
  },

  // === CÁC HÀM CÒN LẠI GIỮ NGUYÊN KHÔNG THAY ĐỔI ===
  
  async deleteWorkflow(id: string): Promise<boolean> {
    try {
      await ElectronAPIClient.request("DELETE", `/api/workflows/${id}`);
      return true;
    } catch (error) {
      logServiceError(SERVICE_NAME, "deleteWorkflow", error);
      return false;
    }
  },
  
  async duplicateWorkflow(id: string): Promise<Workflow | null> {
    try {
      const response = await handleObjectResponse<any>(
        // Sửa lại theo Lựa chọn 1 ở câu trả lời trước, nếu bạn đã áp dụng
        ElectronAPIClient.request("POST", `/api/workflows/${id}/duplicate`),
        SERVICE_NAME,
        "duplicateWorkflow",
        null,
      );

      console.log("🔍 DEBUG - Duplicate response:", response);

      if (response) {
        if (response.workflowContent) {
          const clientFormat = convertToClientFormat(response.workflowContent);
          return {
            ...response,
            nodes: clientFormat.nodes,
            edges: clientFormat.edges,
          };
        }
        return { ...response, nodes: [], edges: [] };
      }
      return response;
    } catch (error) {
      logServiceError(SERVICE_NAME, "duplicateWorkflow", error);
      return null;
    }
  },

  async executeWorkflowWithProfiles(
    id: string,
    params: WorkflowExecutionParams,
  ): Promise<WorkflowExecution | null> {
    try {
      if (ElectronAPIClient.isElectron() && params.profileIds) {
        const result = await ElectronAPIClient.executeWorkflow(
          id,
          params.profileIds,
          { threads: params.threads },
        );
        return result;
      }
      return await handleObjectResponse<WorkflowExecution>(
        ElectronAPIClient.request(
          "POST",
          `/api/workflows/${id}/execute`,
          params,
        ),
        SERVICE_NAME,
        "executeWorkflowWithProfiles",
        null,
      );
    } catch (error) {
      logServiceError(SERVICE_NAME, "executeWorkflowWithProfiles", error);
      return null;
    }
  },

  async executeWorkflowWithGroup(
    id: string,
    params: WorkflowExecutionParams,
  ): Promise<WorkflowExecution | null> {
    try {
      return await handleObjectResponse<WorkflowExecution>(
        ElectronAPIClient.request(
          "POST",
          `/api/workflows/${id}/execute-group`,
          params,
        ),
        SERVICE_NAME,
        "executeWorkflowWithGroup",
        null,
      );
    } catch (error) {
      logServiceError(SERVICE_NAME, "executeWorkflowWithGroup", error);
      return null;
    }
  },

  async stopWorkflowExecution(executionId: string): Promise<boolean> {
    try {
      await ElectronAPIClient.request(
        "POST",
        `/api/workflows/executions/${executionId}/stop`,
      );
      return true;
    } catch (error) {
      logServiceError(SERVICE_NAME, "stopWorkflowExecution", error);
      return false;
    }
  },

  async getWorkflowExecutions(
    workflowId?: string,
  ): Promise<WorkflowExecution[]> {
    try {
      const url = workflowId
        ? `/api/workflows/execution/${workflowId}`
        : "/api/workflows/execution";
      return await handleArrayResponse<WorkflowExecution>(
        ElectronAPIClient.request("GET", url),
        SERVICE_NAME,
        "getWorkflowExecutions",
      );
    } catch (error) {
      logServiceError(SERVICE_NAME, "getWorkflowExecutions", error);
      return [];
    }
  },

  async getWorkflowExecutionDetails(
    executionId: string,
  ): Promise<WorkflowExecution | null> {
    try {
      return await handleObjectResponse<WorkflowExecution>(
        ElectronAPIClient.request(
          "GET",
          `/api/workflows/executions/${executionId}`,
        ),
        SERVICE_NAME,
        "getWorkflowExecutionDetails",
        null,
      );
    } catch (error) {
      logServiceError(SERVICE_NAME, "getWorkflowExecutionDetails", error);
      return null;
    }
  },

  getBasicWorkflowInfo(workflow: Workflow): {
    id: string;
    name: string;
    description?: string;
  } {
    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
    };
  },

  getExecutionStatusInfo(execution: WorkflowExecution): {
    statusText: string;
    statusColor: string;
    duration?: string;
    successRate?: number;
  } {
    const statusMap = {
      pending: { text: "Pending", color: "blue" },
      running: { text: "Running", color: "green" },
      completed: { text: "Completed", color: "green" },
      failed: { text: "Failed", color: "red" },
    };
    const status = statusMap[execution.status];
    let duration;
    if (execution.startTime && execution.endTime) {
      const start = new Date(execution.startTime);
      const end = new Date(execution.endTime);
      const diff = end.getTime() - start.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      duration = `${minutes}m ${seconds}s`;
    }
    let successRate;
    if (execution.results) {
      const total =
        execution.results.successCount + execution.results.failureCount;
      if (total > 0) {
        successRate = (execution.results.successCount / total) * 100;
      }
    }
    return {
      statusText: status.text,
      statusColor: status.color,
      duration,
      successRate,
    };
  },
};
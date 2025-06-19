import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  WorkflowFunctionalService, 
  Workflow, 
  WorkflowExecution,
  WorkflowExecutionParams 
} from '../../lib/new/WorkflowFunctionalService';
import { useToast } from '../use-toast';
import { queryClient } from '../../lib/queryClient';

/**
 * Hook chức năng để quản lý workflows
 * Hook này được sử dụng trong:
 * - WorkflowPage
 * - ProfilePage (phần workflow execution)
 */
export function useWorkflow() {
  const { toast } = useToast();
  
  // Lấy danh sách tất cả workflows
  const {
    data: workflowsResponse,
    isLoading: isLoadingWorkflows,
    error: workflowsError,
    refetch: refetchWorkflows
  } = useQuery({
    queryKey: ['/api/workflows'],
    queryFn: () => WorkflowFunctionalService.getWorkflows(),
  });

  // Đảm bảo workflows luôn là một mảng
  const workflows = workflowsResponse || [];

  // Tạo danh sách workflows cơ bản cho dropdown, list view
  const basicWorkflows = useMemo(() => {
    return workflows.map(workflow => WorkflowFunctionalService.getBasicWorkflowInfo(workflow));
  }, [workflows]);

  // Lấy danh sách tất cả workflow executions
  const {
    data: workflowExecutions = [],
    isLoading: isLoadingExecutions,
    error: executionsError,
    refetch: refetchExecutions
  } = useQuery({
    queryKey: ['/api/workflow-executions'],
    queryFn: () => WorkflowFunctionalService.getWorkflowExecutions(),
  });

  // Lấy chi tiết workflow cụ thể
  const getWorkflowDetails = (workflowId: string) => {
    return useQuery({
      queryKey: ['/api/workflows', workflowId],
      queryFn: () => WorkflowFunctionalService.getWorkflow(workflowId),
      enabled: !!workflowId, // Chỉ gọi khi có workflowId
    });
  };

  // Lấy executions của một workflow cụ thể
  const getWorkflowExecutions = (workflowId: string) => {
    return useQuery({
      queryKey: ['/api/workflow-executions', workflowId],
      queryFn: () => WorkflowFunctionalService.getWorkflowExecutions(workflowId),
      enabled: !!workflowId, // Chỉ gọi khi có workflowId
    });
  };

  // Lấy chi tiết một execution
  const getExecutionDetails = (executionId: string) => {
    return useQuery({
      queryKey: ['/api/workflow-executions', executionId, 'details'],
      queryFn: () => WorkflowFunctionalService.getWorkflowExecutionDetails(executionId),
      enabled: !!executionId, // Chỉ gọi khi có executionId
    });
  };

  // Mutation tạo workflow mới
  const createWorkflowMutation = useMutation({
    mutationFn: (workflowData: Partial<Workflow>) => 
      WorkflowFunctionalService.createWorkflow(workflowData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      toast({
        title: "Workflow Created",
        description: "Workflow has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create workflow",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation cập nhật workflow
  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Workflow> }) => 
      WorkflowFunctionalService.updateWorkflow(id, data),
    
    // SỬA ĐỔI Ở ĐÂY: Thêm 'variables' vào tham số của onSuccess
    onSuccess: (data, variables) => { 
      // `variables` ở đây chính là object bạn truyền vào hàm mutate, tức là { id, data }
      
      // 1. Vô hiệu hóa cache của danh sách workflows (như cũ)
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });

      // 2. [FIX] Vô hiệu hóa cache của chi tiết workflow vừa được cập nhật
      queryClient.invalidateQueries({ queryKey: ['workflow', variables.id] });

      toast({
        title: "Workflow Updated",
        description: "Workflow has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update workflow",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation xóa workflow
  const deleteWorkflowMutation = useMutation({
    mutationFn: (id: string) => WorkflowFunctionalService.deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      toast({
        title: "Workflow Deleted",
        description: "Workflow has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete workflow",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const duplicateWorkflowMutation = useMutation({
    mutationFn: (id: string) => WorkflowFunctionalService.duplicateWorkflow(id),
    onSuccess: () => {
      // Làm mới danh sách workflows để hiển thị bản sao mới
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      toast({
        title: "Workflow Duplicated",
        description: "A copy of the workflow has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to duplicate workflow",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation thực thi workflow với profiles
  const executeWorkflowWithProfilesMutation = useMutation({
    mutationFn: ({ workflowId, params }: { workflowId: string, params: WorkflowExecutionParams }) => 
      WorkflowFunctionalService.executeWorkflowWithProfiles(workflowId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflow-executions'] });
      toast({
        title: "Workflow Started",
        description: "Workflow execution has started successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start workflow",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation thực thi workflow với group
  const executeWorkflowWithGroupMutation = useMutation({
    mutationFn: ({ workflowId, params }: { workflowId: string, params: WorkflowExecutionParams }) => 
      WorkflowFunctionalService.executeWorkflowWithGroup(workflowId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflow-executions'] });
      toast({
        title: "Workflow Started",
        description: "Workflow execution has started for group",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start workflow",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation dừng workflow execution
  const stopWorkflowExecutionMutation = useMutation({
    mutationFn: (executionId: string) => 
      WorkflowFunctionalService.stopWorkflowExecution(executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflow-executions'] });
      toast({
        title: "Workflow Stopped",
        description: "Workflow execution has been stopped",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to stop workflow",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    // Data queries
    workflows,
    basicWorkflows,
    workflowExecutions,
    isLoadingWorkflows,
    isLoadingExecutions,
    workflowsError,
    executionsError,
    refetchWorkflows,
    refetchExecutions,
    getWorkflowDetails,
    getWorkflowExecutions,
    getExecutionDetails,
    
    // Bộ chuyển đổi dữ liệu
    getExecutionStatusInfo: WorkflowFunctionalService.getExecutionStatusInfo,
    
    // Mutations
    createWorkflow: createWorkflowMutation.mutate,
    updateWorkflow: updateWorkflowMutation.mutate,
    deleteWorkflow: deleteWorkflowMutation.mutate,
    executeWorkflowWithProfiles: executeWorkflowWithProfilesMutation.mutate,
    duplicateWorkflow: duplicateWorkflowMutation.mutate,
    executeWorkflowWithGroup: executeWorkflowWithGroupMutation.mutate,
    stopWorkflowExecution: stopWorkflowExecutionMutation.mutate,
    
    // Mutation states
    isCreatingWorkflow: createWorkflowMutation.isPending,
    isUpdatingWorkflow: updateWorkflowMutation.isPending,
    isDeletingWorkflow: deleteWorkflowMutation.isPending,
    isExecutingWorkflowWithProfiles: executeWorkflowWithProfilesMutation.isPending,
    isDuplicatingWorkflow: duplicateWorkflowMutation.isPending,
    isExecutingWorkflowWithGroup: executeWorkflowWithGroupMutation.isPending,
    isStoppingWorkflowExecution: stopWorkflowExecutionMutation.isPending,
  };
}
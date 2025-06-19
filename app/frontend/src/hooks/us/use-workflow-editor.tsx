// File: src/hooks/us/use-workflow-editor.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkflowContext } from '../../context/WorkflowContext';
import { useWorkflow } from './useWorkflow';
import { WorkflowFunctionalService } from '../../lib/new/WorkflowFunctionalService';
import { useToast } from "@/hooks/use-toast";
import type { Node, Edge } from 'reactflow';

interface UseWorkflowEditorProps {
  workflowId?: string;
}

/**
 * Helper function để chuyển đổi dữ liệu node trước khi lưu.
 * THỰC HIỆN CÔNG VIỆC "ĐẢO NGƯỢC" SO VỚI LÚC TẢI DỮ LIỆU.
 */
const formatNodesForBackend = (nodes: Node[]): any[] => {
  console.log("🔍 DEBUG - formatNodesForBackend input nodes:", nodes);
  return nodes.map(({ 
    // Loại bỏ các thuộc tính tạm thời của React Flow
    selected, dragging, positionAbsolute, width, height, 
    // Tách các thuộc tính quan trọng ra
    id, type, position, data,
    ...rest 
  }) => {
    // Trả về một object mới có cấu trúc mà backend mong đợi:
    // id, type, position, và parameters ở cùng cấp.
    const formatted = {
      id,
      type,
      position: position || { x: 0, y: 0 }, // Bảo toàn tọa độ node
      // parameters: data?.parameters || {}, // Lấy parameters từ data
      // Bảo toàn tất cả các thuộc tính khác của data
      data: data || {},
    };
    console.log("🔍 DEBUG - Formatted node:", formatted);
    return formatted;
  });
};

const formatEdgesForBackend = (edges: Edge[]): any[] => {
  console.log("🔍 DEBUG - formatEdgesForBackend input edges:", edges);
  return edges.map(({ 
    // Loại bỏ các thuộc tính tạm thời của React Flow
    selected, animated, style, markerEnd,
    // Tách các thuộc tính quan trọng ra
    id, source, target, sourceHandle, targetHandle, type, data,
    ...rest 
  }) => {
    const formatted = {
      id,
      from: source, // Backend expects 'from' instead of 'source'
      to: target,   // Backend expects 'to' instead of 'target'
      type: type || 'default',
      sourceHandle,
      targetHandle,
      data: data || {},
    };
    console.log("🔍 DEBUG - Formatted edge:", formatted);
    return formatted;
  });
};

/**
 * Helper function để chuyển đổi dữ liệu edge từ backend.
 * THỰC HIỆN CÔNG VIỆC "ĐẢO NGƯỢC" SO VỚI LÚC LƯU DỮ LIỆU.
 */
const formatEdgesFromBackend = (edges: any[]): Edge[] => {
  if (!edges) return [];
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    type: edge.type || 'custom',
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    data: edge.data || {},
  }));
};

export const useWorkflowEditor = ({ workflowId }: UseWorkflowEditorProps) => {
  // === 1. KẾT NỐI VỚI CÁC HỆ THỐNG KHÁC ===
  const { toast } = useToast();
  const { nodes, edges, setNodes, setEdges } = useWorkflowContext();
  const { createWorkflow, updateWorkflow, isCreatingWorkflow, isUpdatingWorkflow } = useWorkflow();

  // === 2. QUẢN LÝ STATE CỦA TRANG EDITOR ===
  const [currentWorkflow, setCurrentWorkflow] = useState<{ id?: string, name: string }>({
    id: workflowId,
    name: "Untitled Workflow",
  });
  const [isEditingName, setIsEditingName] = useState(false);

  // === 3. LOGIC TẢI DỮ LIỆU ===
  const { data: fetchedWorkflowData, isLoading: isLoadingWorkflow } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => WorkflowFunctionalService.getWorkflow(workflowId!),
    enabled: !!workflowId,
  });

  useEffect(() => {
    if (fetchedWorkflowData) {
      console.log("🔍 DEBUG - Fetched workflow data:", fetchedWorkflowData);
      
      const nodesFromBackend = fetchedWorkflowData.nodes || [];
      const edgesFromBackend = fetchedWorkflowData.edges || [];

      const formattedEdges = formatEdgesFromBackend(edgesFromBackend);

      console.log("🔍 DEBUG - Nodes from backend:", nodesFromBackend);
      console.log("🔍 DEBUG - Edges from backend:", edgesFromBackend);

      setCurrentWorkflow({ id: fetchedWorkflowData.id, name: fetchedWorkflowData.name });
      setNodes(nodesFromBackend);
      setEdges(formattedEdges);
    }
  }, [fetchedWorkflowData, setNodes, setEdges]);
  
  // === 4. CÁC HÀM LƯU DỮ LIỆU ===

  const handleSave = useCallback(() => {
    console.log("🔍 DEBUG - handleSave called with nodes:", nodes);
    console.log("🔍 DEBUG - handleSave called with edges:", edges);

    // Kiểm tra nếu không có nodes và edges thì không lưu
    if (nodes.length === 0 && edges.length === 0 && !workflowId) {
      console.log("🔍 DEBUG - No content to save, skipping");
      return Promise.resolve();
    }

    const formattedNodes = formatNodesForBackend(nodes);
    const formattedEdges = formatEdgesForBackend(edges);
    
    console.log("🔍 DEBUG - Formatted nodes for backend:", formattedNodes);
    console.log("🔍 DEBUG - Formatted edges for backend:", formattedEdges);

    const dataToSave = {
      name: currentWorkflow.name.trim() || "Untitled Workflow",
      workflowContent: {
        nodes: formattedNodes,
        edges: formattedEdges,
      },
    };

    console.log("🔍 DEBUG - Final data to save:", dataToSave);

    return new Promise((resolve, reject) => {
      if (currentWorkflow.id) {
        updateWorkflow(
          { id: currentWorkflow.id, data: dataToSave },
          {
            onSuccess: (updatedWorkflow) => {
              console.log("🔍 DEBUG - Update success:", updatedWorkflow);
              toast({ title: "Workflow Updated" });
              resolve(updatedWorkflow);
            },
            onError: (error) => {
              console.error("🔍 DEBUG - Update error:", error);
              toast({ title: "Update Failed", variant: "destructive" });
              reject(error);
            },
          }
        );
      } else {
        createWorkflow(
          dataToSave,
          {
            onSuccess: (newWorkflow) => {
              console.log("🔍 DEBUG - Create success:", newWorkflow);
              if (newWorkflow && newWorkflow.id) {
                setCurrentWorkflow((prev) => ({ ...prev, id: newWorkflow.id, name: newWorkflow.name }));
                toast({ title: "Workflow Created" });
                resolve(newWorkflow);
              } else {
                reject(new Error("Create did not return a valid workflow."));
              }
            },
            onError: (error) => {
              console.error("🔍 DEBUG - Create error:", error);
              toast({ title: "Create Failed", variant: "destructive" });
              reject(error);
            },
          }
        );
      }
    });
  }, [currentWorkflow, nodes, edges, createWorkflow, updateWorkflow, toast, setCurrentWorkflow, workflowId]);
  
  const saveOnUnload = useCallback(() => {
    if (nodes.length === 0 && edges.length === 0 && !workflowId) return; 
    
    const formattedNodes = formatNodesForBackend(nodes);
    const formattedEdges = formatEdgesForBackend(edges);
    
    const dataToSave = {
      name: currentWorkflow.name.trim() || "Untitled Workflow",
      workflowContent: {
        nodes: formattedNodes,
        edges: formattedEdges,
      }
    };
    
    if (currentWorkflow.id) {
      updateWorkflow({ id: currentWorkflow.id, data: dataToSave });
    } else {
      createWorkflow(dataToSave);
    }
  }, [currentWorkflow, nodes, edges, createWorkflow, updateWorkflow, workflowId]);

  // === 5. CÁC HÀM XỬ LÝ SỰ KIỆN CHO UI ===
  const handleStartEditingName = () => setIsEditingName(true);
  const handleNameChange = (name: string) => setCurrentWorkflow(prev => ({ ...prev, name }));
  
  const handleNameBlur = () => {
    setIsEditingName(false);
    handleSave().catch(err => console.error("Auto-save on name blur failed:", err));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsEditingName(false);
      handleSave().catch(err => console.error("Auto-save on enter key failed:", err));
    }
  };

  // === 6. TRẢ VỀ CÁC GIÁ TRỊ VÀ HÀM CHO COMPONENT ===
  return {
    currentWorkflow,
    isEditingName,
    isLoading: isLoadingWorkflow || isCreatingWorkflow || isUpdatingWorkflow,
    handleSave,
    saveOnUnload,
    handleStartEditingName,
    handleNameChange,
    handleNameBlur,
    handleKeyDown,
  };
};
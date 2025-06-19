import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowInstance,
  Edge,
  Node,
} from "reactflow";
import { getLayoutedElements } from "./layout";
import { useHistory } from "./useHistory";

// Simplified interfaces
export interface NodeData {
  nodeId: string;
  label: string;
  category?: string;
  description?: string;
}

type WorkflowContextType = {
  nodes: any[];
  edges: any[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>; // <-- THÊM MỚI
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>; // <-- THÊM MỚI
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  addNode: (node: any) => void;
  onNodeClick: (event: any, node: any) => void;
  selectedNode: any | null;
  updateNodeData: (nodeId: string, data: any) => void;
  deleteNode: (nodeId?: string) => void;
  duplicateNode: (nodeId: string) => void;
  deleteSelectedNodes: () => void;
  selectAllNodes: () => void;
  autoLayout: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  exportWorkflow: () => string;
  importWorkflow: (jsonData: string) => void;
};

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined,
);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Debug ReactFlow state changes
  useEffect(() => {
    console.log("ReactFlow nodes state changed:", nodes.length, nodes);
  }, [nodes]);
  
  useEffect(() => {
    console.log("ReactFlow edges state changed:", edges.length, edges);
  }, [edges]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // History management for undo/redo
  const {
    present: workflowState,
    set: setWorkflowState,
    undo: undoHistory,
    redo: redoHistory,
    canUndo: canUndoHistory,
    canRedo: canRedoHistory
  } = useHistory<{ nodes: any[], edges: any[] }>({ nodes: [], edges: [] });

  // Flag to prevent sync conflicts during import
  const [isImporting, setIsImporting] = useState(false);

  // Sync history state with ReactFlow when undo/redo happens
  useEffect(() => {
    // Skip sync during import to prevent conflicts
    if (isImporting) return;
    
    if (JSON.stringify(workflowState.nodes) !== JSON.stringify(nodes) || 
        JSON.stringify(workflowState.edges) !== JSON.stringify(edges)) {
      setNodes(workflowState.nodes);
      setEdges(workflowState.edges);
    }
  }, [workflowState, isImporting]);

  // Save to history helper function
  const saveToHistory = useCallback((newNodes: any[], newEdges: any[]) => {
    console.log("Saving to history - Nodes:", JSON.stringify(newNodes, null, 2));
    console.log("Saving to history - Edges:", JSON.stringify(newEdges, null, 2));
    setWorkflowState({
      nodes: [...newNodes],
      edges: [...newEdges]
    });
  }, [setWorkflowState]);

  // Connect function with proper ReactFlow integration
  const onConnect = useCallback(
    (params: Connection) => {
      console.log("WorkflowContext: Connect:", params);
      setEdges((eds) => {
        const newEdges = addEdge(params, eds);
        saveToHistory(nodes, newEdges);
        return newEdges;
      });
    },
    [setEdges, nodes, saveToHistory],
  );

  // Add node function using ReactFlow's setNodes
  const addNode = useCallback(
    (node: any) => {
      console.log("WorkflowContext: Adding node:", node);
      console.log("WorkflowContext: Current nodes before adding:", nodes);

      // Ensure unique ID and add to nodes array
      const newNode = {
        ...node,
        id:
          node.id ||
          `${node.data?.nodeId || "node"}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: node.position || { x: 0, y: 0 },
      };
      console.log("WorkflowContext: Final node to add:", newNode);

      setNodes((prevNodes) => {
        console.log("WorkflowContext: Previous nodes in setter:", prevNodes);
        const updated = [...prevNodes, newNode];
        console.log("WorkflowContext: Updated nodes array:", updated);
        
        // Save to history
        saveToHistory(updated, edges);
        
        return updated;
      });
    },
    [nodes, setNodes, edges, saveToHistory],
  );

  const onNodeClick = useCallback((_event: any, node: any) => {
    console.log("WorkflowContext: Node clicked:", node);
    setSelectedNode(node);
  }, []);

  const updateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((currentNodes) => {
        const updated = currentNodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...newData } };
          }
          return node;
        });
        saveToHistory(updated, edges);
        return updated;
      });
    },
    [setNodes, edges, saveToHistory],
  );

  const deleteNode = useCallback(
    (nodeId?: string) => {
      if (!nodeId && selectedNode) {
        nodeId = selectedNode.id;
      }
      if (!nodeId) return;

      const newNodes = nodes.filter((node) => node.id !== nodeId);
      const newEdges = edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
      
      setNodes(newNodes);
      setEdges(newEdges);
      saveToHistory(newNodes, newEdges);
      
      // Clear selection if deleted node was selected
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [nodes, edges, selectedNode, setNodes, setEdges, saveToHistory],
  );

  const duplicateNode = useCallback(
    (nodeId: string) => {
      const nodeToDuplicate = nodes.find((node) => node.id === nodeId);
      if (!nodeToDuplicate) return;

      const newNode = {
        ...nodeToDuplicate,
        id: `${nodeToDuplicate.data.nodeId}_${Date.now()}`,
        position: {
          x: nodeToDuplicate.position.x + 50,
          y: nodeToDuplicate.position.y + 50,
        },
        selected: false,
      };

      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      saveToHistory(newNodes, edges);
    },
    [nodes, edges, setNodes, saveToHistory],
  );

  const deleteSelectedNodes = useCallback(() => {
    if (!reactFlowInstance) return;

    const selectedNodes = reactFlowInstance.getNodes().filter((n) => n.selected);
    const selectedEdges = reactFlowInstance.getEdges().filter((e) => e.selected);
    const nodeIdsToDelete = new Set(selectedNodes.map((n) => n.id));

    const remainingNodes = reactFlowInstance.getNodes().filter((n) => !n.selected);
    const remainingEdges = reactFlowInstance.getEdges().filter(
      (edge) =>
        !nodeIdsToDelete.has(edge.source) &&
        !nodeIdsToDelete.has(edge.target) &&
        !selectedEdges.find((se) => se.id === edge.id),
    );

    setNodes(remainingNodes);
    setEdges(remainingEdges);
    saveToHistory(remainingNodes, remainingEdges);
    
    // Clear selection
    setSelectedNode(null);
  }, [reactFlowInstance, setNodes, setEdges, saveToHistory]);

  const selectAllNodes = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: true,
      })),
    );
  }, [setNodes]);

  const autoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    saveToHistory(layoutedNodes, layoutedEdges);
  }, [nodes, edges, setNodes, setEdges, saveToHistory]);

  // Implement undo function
  const undo = useCallback(() => {
    if (canUndoHistory) {
      undoHistory();
    }
  }, [canUndoHistory, undoHistory]);

  // Implement redo function
  const redo = useCallback(() => {
    if (canRedoHistory) {
      redoHistory();
    }
  }, [canRedoHistory, redoHistory]);

  const exportWorkflow = useCallback(() => {
    // Use current ReactFlow state for most up-to-date data
    console.log("Exporting workflow - ReactFlow Nodes:", nodes);
    console.log("Exporting workflow - ReactFlow Edges:", edges);
    console.log("Exporting workflow - History Nodes:", workflowState.nodes);
    console.log("Exporting workflow - History Edges:", workflowState.edges);
    
    // Use ReactFlow state if it has data, otherwise use history state
    const nodesToExport = nodes.length > 0 ? nodes : workflowState.nodes;
    const edgesToExport = edges.length > 0 ? edges : workflowState.edges;
    
    console.log("Final export - Nodes:", nodesToExport);
    console.log("Final export - Edges:", edgesToExport);
    
    return JSON.stringify({ nodes: nodesToExport, edges: edgesToExport }, null, 2);
  }, [nodes, edges, workflowState]);

  const importWorkflow = useCallback((jsonData: string) => {
    try {
      setIsImporting(true);
      console.log("Raw JSON data:", jsonData);
      
      const data = JSON.parse(jsonData);
      console.log("Parsed data:", data);
      console.log("Data type:", typeof data);
      console.log("Data keys:", Object.keys(data));
      
      // Handle different data formats
      let nodesToImport = [];
      let edgesToImport = [];
      
      // Check if it's the export format with metadata
      if (data.workflow && data.workflow.nodes && data.workflow.edges) {
        nodesToImport = data.workflow.nodes;
        edgesToImport = data.workflow.edges;
        console.log("Using workflow metadata format");
      }
      // Check if it's direct format
      else if (data.nodes && data.edges) {
        nodesToImport = data.nodes;
        edgesToImport = data.edges;
        console.log("Using direct format");
      }
      // Check if it's array format
      else if (Array.isArray(data) && data.length >= 2) {
        nodesToImport = data[0];
        edgesToImport = data[1];
        console.log("Using array format");
      }
      else {
        throw new Error("Invalid workflow format: cannot find nodes or edges");
      }
      
      if (!Array.isArray(nodesToImport) || !Array.isArray(edgesToImport)) {
        throw new Error("Invalid workflow format: nodes and edges must be arrays");
      }
      
      console.log("Nodes to import:", nodesToImport);
      console.log("Nodes count:", nodesToImport.length);
      console.log("Edges to import:", edgesToImport);
      console.log("Edges count:", edgesToImport.length);
      
      // Import data directly
      setNodes(nodesToImport);
      setEdges(edgesToImport);
      
      // Update history after successful import
      setTimeout(() => {
        saveToHistory(nodesToImport, edgesToImport);
        setIsImporting(false);
        console.log("Import completed. Current nodes:", nodesToImport.length);
      }, 50);
      
    } catch (error) {
      setIsImporting(false);
      console.error("Error importing workflow:", error);
      throw error;
    }
  }, [setNodes, setEdges, saveToHistory]);

  const value = {
    nodes,
    edges,
    setNodes, // <-- THÊM MỚI
    setEdges, // <-- THÊM MỚI
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    onNodeClick,
    selectedNode,
    updateNodeData,
    deleteNode,
    duplicateNode,
    deleteSelectedNodes,
    selectAllNodes,
    autoLayout,
    undo,
    redo,
    canUndo: canUndoHistory,
    canRedo: canRedoHistory,
    exportWorkflow,
    importWorkflow,
    setReactFlowInstance,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflowContext = (): WorkflowContextType => {
  const context = useContext(WorkflowContext);

  if (context === undefined) {
    throw new Error(
      "useWorkflowContext must be used within a WorkflowProvider",
    );
  }

  return context;
};
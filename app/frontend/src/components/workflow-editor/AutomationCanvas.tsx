import React, { useCallback, useMemo, useEffect, useContext } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  NodeTypes,
  EdgeTypes,
  OnConnectStart,
  OnConnectEnd,
  Connection,
  useReactFlow,
  NodeDragHandler,
  ReactFlowInstance,SelectionMode
} from 'reactflow';
import './reactflow-styles.css';
import { useWorkflowContext } from '../../context/WorkflowContext';

// Import custom nodes
import ActionNode from './NodeTypes/ActionNode';
import ConditionNode from './NodeTypes/ConditionNode';
import TriggerNode from './NodeTypes/TriggerNode';
import OutputNode from './NodeTypes/OutputNode';
import DataNode from './NodeTypes/DataNode';
import LoopNode from './NodeTypes/LoopNode';
import ServiceNode from './NodeTypes/ServiceNode';
import WaitNode from './NodeTypes/WaitNode';
import CustomEdge from './EdgeTypes/CustomEdge';

// Đã loại bỏ imports từ hệ thống cũ

// Define node and edge types outside the component to avoid recreation on each render
const nodeTypes: NodeTypes = {
  actionNode: ActionNode,
  conditionNode: ConditionNode,
  triggerNode: TriggerNode,
  outputNode: OutputNode,
  dataNode: DataNode,
  loopNode: LoopNode,
  serviceNode: ServiceNode,
  waitNode: WaitNode
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge
};

interface AutomationCanvasProps {
  editorRef?: React.MutableRefObject<{
    undo: () => void;
    redo: () => void;
    autoLayout: () => void;
    deleteSelectedNodes: () => void;
    selectAllNodes: () => void;
  }>;
}

const AutomationCanvas: React.FC<AutomationCanvasProps> = ({ editorRef }) => {
  const reactFlowInstance = useReactFlow();
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    onNodeClick,
    addNode,
    undo,
    redo,
    autoLayout,
    selectAllNodes,
    deleteSelectedNodes,setReactFlowInstance
  } = useWorkflowContext();
  
  // Expose workflow functions to parent component
  useEffect(() => {
    if (editorRef) {
      editorRef.current = {
        undo,
        redo,
        autoLayout,
        deleteSelectedNodes,
        selectAllNodes
      };
    }
  }, [editorRef, undo, redo, autoLayout, deleteSelectedNodes,selectAllNodes]);

  useEffect(() => {
    if (reactFlowInstance) {
      setReactFlowInstance(reactFlowInstance);
    }
  }, [reactFlowInstance, setReactFlowInstance]);

  // Using pre-defined nodeTypes and edgeTypes from outside the component

  // Handle dropping nodes onto the canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
  event.preventDefault();
  if (!reactFlowInstance) return;

  const reactFlowBounds = event.currentTarget.getBoundingClientRect();
  const nodeType = event.dataTransfer.getData('application/reactflow/type');
  const nodeDataJSON = event.dataTransfer.getData('application/reactflow/data');

  if (!nodeType || !nodeDataJSON) return;

  try {
    const nodeData = JSON.parse(nodeDataJSON);
    // Chuyển đổi tọa độ bằng project
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = {
      id: `${nodeData.nodeId}_${Date.now()}`,
      type: nodeType,
      position,
      data: {
        ...nodeData,
        parameters: nodeData.parameters || {},
      },
    };

    addNode(newNode);
  } catch (error) {
    console.error('AutomationCanvas: Failed to parse node data:', error);
  }
}, [reactFlowInstance, addNode]);

  // Drag connection line visualization
  const [connectingNodeId, setConnectingNodeId] = React.useState<string | null>(null);
  
  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    setConnectingNodeId(nodeId || null);
  }, []);
  
  const onConnectEnd: OnConnectEnd = useCallback(() => {
    setConnectingNodeId(null);
  }, []);

  return (
    <div className="flex-1 h-full bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        deleteKeyCode="Delete"
        selectionMode={SelectionMode.Partial}

        selectionOnDrag={true}
        selectNodesOnDrag={true}
        onKeyDown={(event) => {
          if (event.key === 'Delete') {
            deleteSelectedNodes();
          }
        }}
        fitView
        attributionPosition="bottom-right"
        defaultEdgeOptions={{ 
          type: 'custom', 
          animated: true 
        }}
      >
        <Background />
        <Controls className="border border-gray-800 shadow-sm bg-gray-800 text-white" />
      </ReactFlow>
    </div>
  );
};

export default AutomationCanvas;
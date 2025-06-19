import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BrainCircuit } from 'lucide-react';
import { NodeData } from '@/context/WorkflowContext';

const ConditionNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  return (
    <div className={`px-2 py-1 rounded-md shadow-sm border min-w-[80px] ${selected ? 'border-gray-300 ring-1 ring-pink-500/20' : 'border-gray-300'} bg-white`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!bg-pink-500 !border-0 w-1 h-1 -ml-[0.5px]"
      />

      <div className="flex items-center">
        <div className="h-3.5 w-3.5 rounded-sm text-pink-500 flex items-center justify-center mr-1.5">
          <BrainCircuit className="h-2.5 w-2.5" />
        </div>
        
        <div className="min-w-0">
          <div className="font-medium truncate text-[10px] leading-tight text-black">{data.label}</div>
        </div>
      </div>

      {/* Two outputs for true and false conditions - no text labels */}
      <div className="flex justify-end -mr-[0.5px]">
        <Handle 
          type="source" 
          position={Position.Right} 
          id="true"
          className="!bg-green-500 !border-0 w-1 h-1 !-right-[0.5px] !top-[35%]"
        />
        
        <Handle 
          type="source" 
          position={Position.Right} 
          id="false"
          className="!bg-red-500 !border-0 w-1 h-1 !-right-[0.5px] !top-[65%]"
        />
      </div>
    </div>
  );
};

export default memo(ConditionNode);
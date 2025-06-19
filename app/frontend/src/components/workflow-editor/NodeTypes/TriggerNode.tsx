import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';
import { NodeData } from '@/context/WorkflowContext';

const TriggerNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  return (
    <div className={`px-2 py-1 rounded-md shadow-sm border min-w-[80px] ${selected ? 'border-gray-300 ring-1 ring-amber-500/20' : 'border-gray-300'} bg-white`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-3.5 w-3.5 rounded-sm text-amber-500 flex items-center justify-center mr-1.5">
            <Zap className="h-2.5 w-2.5" />
          </div>
          
          <div className="min-w-0">
            <div className="font-medium truncate text-[10px] leading-tight text-black">{data.label}</div>
          </div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-amber-500 !border-0 w-1 h-1 -mr-[0.5px]"
      />
    </div>
  );
};

export default memo(TriggerNode);
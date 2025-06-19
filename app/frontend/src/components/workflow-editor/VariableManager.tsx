import React, { useState, useEffect } from 'react';
import { useWorkflowContext } from '../../context/WorkflowContext';
import { Variable, Code, Plus, Trash2, Copy, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

interface WorkflowVariable {
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  description?: string;
  nodeId?: string; // Node tạo ra biến này
}

export default function VariableManager() {
  const { nodes } = useWorkflowContext();
  const [variables, setVariables] = useState<WorkflowVariable[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // Tự động phát hiện biến từ các node
  useEffect(() => {
    const detectedVariables: WorkflowVariable[] = [];
    
    nodes.forEach(node => {
      const nodeData = node.data;
      
      // Phát hiện node tạo biến
      if (nodeData.nodeId === 'variable') {
        const varName = nodeData.parameters?.name;
        const varValue = nodeData.parameters?.value;
        if (varName) {
          detectedVariables.push({
            name: varName,
            value: varValue || '',
            type: inferType(varValue),
            description: `Được tạo bởi node ${node.id}`,
            nodeId: node.id
          });
        }
      }
      
      // Phát hiện biến được tham chiếu trong các parameter
      Object.entries(nodeData.parameters || {}).forEach(([key, value]) => {
        if (typeof value === 'string' && value.startsWith('$')) {
          const varName = value.substring(1);
          if (!detectedVariables.find(v => v.name === varName)) {
            detectedVariables.push({
              name: varName,
              value: '[Chưa định nghĩa]',
              type: 'string',
              description: `Được tham chiếu trong ${nodeData.label || node.type}`
            });
          }
        }
      });
    });

    setVariables(detectedVariables);
  }, [nodes]);

  const inferType = (value: any): 'string' | 'number' | 'boolean' | 'object' => {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'object') return 'object';
    if (!isNaN(Number(value)) && value !== '') return 'number';
    if (value === 'true' || value === 'false') return 'boolean';
    return 'string';
  };

  const filteredVariables = variables.filter(variable =>
    variable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    variable.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, variable: WorkflowVariable) => {
    e.dataTransfer.setData('text/plain', `$${variable.name}`);
    e.dataTransfer.setData('application/variable', JSON.stringify(variable));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const copyToClipboard = (varName: string) => {
    navigator.clipboard.writeText(`$${varName}`);
    // TODO: Add toast notification
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'number': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'boolean': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'object': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-80 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Variable className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Biến</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm biến..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </div>

      {/* Variable List */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredVariables.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Variable className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Chưa có biến nào</p>
              <p className="text-xs mt-1">Tạo node "Biến" để bắt đầu</p>
            </div>
          ) : (
            filteredVariables.map((variable, index) => (
              <div
                key={`${variable.name}-${index}`}
                className="group bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-move"
                draggable
                onDragStart={(e) => handleDragStart(e, variable)}
                title="Kéo để sử dụng biến này"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Code className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <span className="font-mono text-sm font-medium text-gray-900 dark:text-white truncate">
                      ${variable.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={`text-xs ${getTypeColor(variable.type)}`}>
                      {variable.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(variable.name)}
                      title="Sao chép tham chiếu"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span className="font-medium">Giá trị:</span> {
                    variable.value === '[Chưa định nghĩa]' 
                      ? <span className="text-red-500">{variable.value}</span>
                      : <span className="font-mono">{variable.value}</span>
                  }
                </div>
                
                {variable.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {variable.description}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Quick Actions */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            💡 <strong>Mẹo:</strong> Kéo biến vào node để sử dụng, hoặc gõ $ để tự động hoàn thành
          </div>
        </div>
      )}
    </div>
  );
}
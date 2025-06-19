import React from 'react';
import { X, Settings } from 'lucide-react';
import { useWorkflowContext } from '../../context/WorkflowContext';

const PropertiesPanel: React.FC = () => {
  const { selectedNode, updateNodeData } = useWorkflowContext();

  if (!selectedNode) {
    return (
      <div className="w-72 bg-slate-800 border-l border-slate-700 flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-medium">Properties</h3>
          </div>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center text-slate-500 text-sm">
          Select a node to view and edit its properties
        </div>
      </div>
    );
  }

  // Extract properties from the selected node
  const { data } = selectedNode;
  
  // Define parameter fields based on node type and ID
  let parameterFields: { name: string; label: string; type: string; options?: string[] }[] = [];
  
  switch (selectedNode.type) {
    case 'triggerNode':
      if (data.nodeId === 'browser-start') {
        parameterFields = [
          { name: 'profile', label: 'Browser Profile', type: 'select', options: ['Default', 'Profile 1', 'Profile 2'] },
          { name: 'browserType', label: 'Browser Type', type: 'select', options: ['Chrome', 'Firefox', 'Safari'] },
        ];
      } else if (data.nodeId === 'schedule') {
        parameterFields = [
          { name: 'frequency', label: 'Frequency', type: 'select', options: ['Hourly', 'Daily', 'Weekly', 'Monthly'] },
          { name: 'startTime', label: 'Start Time', type: 'time' },
        ];
      } else if (data.nodeId === 'webhook') {
        parameterFields = [
          { name: 'endpoint', label: 'Webhook URL', type: 'text' },
          { name: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
        ];
      }
      break;
      
    case 'actionNode':
      if (data.nodeId === 'navigate') {
        parameterFields = [
          { name: 'url', label: 'URL', type: 'text' },
          { name: 'waitUntil', label: 'Wait Until', type: 'select', options: ['load', 'domcontentloaded', 'networkidle0'] },
        ];
      } else if (data.nodeId === 'click') {
        parameterFields = [
          { name: 'selector', label: 'Element Selector', type: 'text' },
          { name: 'button', label: 'Mouse Button', type: 'select', options: ['left', 'middle', 'right'] },
        ];
      } else if (data.nodeId === 'input') {
        parameterFields = [
          { name: 'selector', label: 'Element Selector', type: 'text' },
          { name: 'value', label: 'Input Value', type: 'text' },
        ];
      } else if (data.nodeId === 'wait') {
        parameterFields = [
          { name: 'duration', label: 'Duration (ms)', type: 'number' },
          { name: 'selector', label: 'Wait for Element (optional)', type: 'text' },
        ];
      } else if (data.nodeId === 'screenshot') {
        parameterFields = [
          { name: 'filename', label: 'Filename', type: 'text' },
          { name: 'fullPage', label: 'Full Page', type: 'checkbox' },
        ];
      }
      break;
      
    case 'conditionNode':
      if (data.nodeId === 'if-else') {
        parameterFields = [
          { name: 'leftOperand', label: 'Left Operand', type: 'text' },
          { name: 'operator', label: 'Operator', type: 'select', options: ['==', '!=', '>', '<', '>=', '<=', 'contains'] },
          { name: 'rightOperand', label: 'Right Operand', type: 'text' },
        ];
      } else if (data.nodeId === 'switch') {
        parameterFields = [
          { name: 'expression', label: 'Expression', type: 'text' },
          { name: 'cases', label: 'Cases (comma separated)', type: 'text' },
        ];
      } else if (data.nodeId === 'loop') {
        parameterFields = [
          { name: 'type', label: 'Loop Type', type: 'select', options: ['For', 'While', 'ForEach'] },
          { name: 'count', label: 'Count/Condition', type: 'text' },
        ];
      }
      break;
      
    case 'outputNode':
      if (data.nodeId === 'save-data') {
        parameterFields = [
          { name: 'filename', label: 'Filename', type: 'text' },
          { name: 'format', label: 'Format', type: 'select', options: ['JSON', 'CSV', 'TXT'] },
        ];
      } else if (data.nodeId === 'api-call') {
        parameterFields = [
          { name: 'url', label: 'API URL', type: 'text' },
          { name: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
          { name: 'headers', label: 'Headers (JSON)', type: 'textarea' },
          { name: 'body', label: 'Body (JSON)', type: 'textarea' },
        ];
      } else if (data.nodeId === 'notification') {
        parameterFields = [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'message', label: 'Message', type: 'textarea' },
          { name: 'type', label: 'Type', type: 'select', options: ['info', 'success', 'warning', 'error'] },
        ];
      }
      break;
  }

  const handleInputChange = (name: string, value: string | boolean) => {
    const updatedData = {
      ...data,
      parameters: {
        ...data.parameters,
        [name]: value
      }
    };
    
    updateNodeData(selectedNode.id, updatedData);
  };

  // Helper function to render different input types
  const renderInputField = (field: { name: string; label: string; type: string; options?: string[] }) => {
    const value = data.parameters?.[field.name] || '';
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full bg-slate-700 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full bg-slate-700 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
      
      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full bg-slate-700 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={(e) => handleInputChange(field.name, e.target.checked)}
            className="h-4 w-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            rows={3}
            className="w-full bg-slate-700 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
      
      case 'time':
        return (
          <input
            type="time"
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full bg-slate-700 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
      
      default:
        return null;
    }
  };

  // Get the node color based on its type
  let headerColor = 'bg-slate-700';
  let borderColor = 'border-slate-600';
  let iconColor = 'text-slate-400';
  
  switch (selectedNode.type) {
    case 'triggerNode':
      headerColor = 'bg-blue-600/20';
      borderColor = 'border-blue-600/50';
      iconColor = 'text-blue-500';
      break;
    case 'actionNode':
      headerColor = 'bg-green-600/20';
      borderColor = 'border-green-600/50';
      iconColor = 'text-green-500';
      break;
    case 'conditionNode':
      headerColor = 'bg-orange-600/20';
      borderColor = 'border-orange-600/50';
      iconColor = 'text-orange-500';
      break;
    case 'outputNode':
      headerColor = 'bg-purple-600/20';
      borderColor = 'border-purple-600/50';
      iconColor = 'text-purple-500';
      break;
    case 'dataNode':
      headerColor = 'bg-purple-600/20';
      borderColor = 'border-purple-600/50';
      iconColor = 'text-purple-500';
      break;
    case 'loopNode':
      headerColor = 'bg-purple-600/20';
      borderColor = 'border-purple-600/50';
      iconColor = 'text-purple-500';
      break;
    case 'serviceNode':
      headerColor = 'bg-purple-600/20';
      borderColor = 'border-purple-600/50';
      iconColor = 'text-purple-500';
      break;
    case 'waitNode':
      headerColor = 'bg-purple-600/20';
      borderColor = 'border-purple-600/50';
      iconColor = 'text-purple-500';
      break;
  }

  return (
    <div className="w-72 bg-slate-800 border-l border-slate-700 flex flex-col h-full">
      <div className={`flex items-center justify-between p-4 border-b ${borderColor} ${headerColor}`}>
        <div className="flex items-center gap-2">
          <Settings className={`h-4 w-4 ${iconColor}`} />
          <h3 className="text-sm font-medium">{data.label}</h3>
        </div>
        <button className="text-slate-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-1">Node ID</label>
            <input
              type="text"
              value={selectedNode.id}
              disabled
              className="w-full bg-slate-700/50 rounded-md p-2 text-sm text-slate-400"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-1">Display Name</label>
            <input
              type="text"
              value={data.label}
              onChange={(e) => updateNodeData(selectedNode.id, { ...data, label: e.target.value })}
              className="w-full bg-slate-700 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <h4 className="text-xs font-medium text-slate-400 mb-3 mt-6">Parameters</h4>
          
          {parameterFields.length > 0 ? (
            <div className="space-y-4">
              {parameterFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {field.label}
                  </label>
                  {renderInputField(field)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No configurable parameters for this node.</p>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-700">
        <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors">
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
import React, { useState, useRef, useEffect } from 'react';
import { useWorkflowContext } from '../../context/WorkflowContext';
import { Variable, Check } from 'lucide-react';

interface VariableAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface Variable {
  name: string;
  value: string;
  type: string;
  description?: string;
}

export default function VariableAutocomplete({ 
  value, 
  onChange, 
  placeholder,
  className = ''
}: VariableAutocompleteProps) {
  const { nodes } = useWorkflowContext();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Variable[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Phát hiện biến từ workflow
  const getAvailableVariables = (): Variable[] => {
    const variables: Variable[] = [];
    
    nodes.forEach(node => {
      const nodeData = node.data;
      
      // Node tạo biến
      if (nodeData.nodeId === 'variable') {
        const varName = nodeData.parameters?.name;
        const varValue = nodeData.parameters?.value;
        if (varName) {
          variables.push({
            name: varName,
            value: varValue || '',
            type: inferType(varValue),
            description: `Từ node ${nodeData.label}`
          });
        }
      }
    });
    
    // Thêm một số biến hệ thống phổ biến
    const systemVars = [
      { name: 'currentUrl', value: '', type: 'string', description: 'URL hiện tại của trang' },
      { name: 'timestamp', value: '', type: 'number', description: 'Thời gian hiện tại' },
      { name: 'randomId', value: '', type: 'string', description: 'ID ngẫu nhiên' },
      { name: 'userAgent', value: '', type: 'string', description: 'User Agent của trình duyệt' }
    ];
    
    return [...variables, ...systemVars];
  };

  const inferType = (value: any): string => {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (!isNaN(Number(value)) && value !== '') return 'number';
    if (value === 'true' || value === 'false') return 'boolean';
    return 'string';
  };

  // Tìm vị trí $ gần nhất với cursor
  const findDollarPosition = (text: string, position: number): number => {
    for (let i = position; i >= 0; i--) {
      if (text[i] === '$') {
        // Kiểm tra xem có phải là đầu từ không
        if (i === 0 || /\s/.test(text[i - 1])) {
          return i;
        }
      }
      // Nếu gặp khoảng trắng thì dừng
      if (/\s/.test(text[i])) {
        break;
      }
    }
    return -1;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(newCursorPosition);

    // Kiểm tra xem có đang gõ biến không
    const dollarPos = findDollarPosition(newValue, newCursorPosition - 1);
    
    if (dollarPos !== -1) {
      const variableText = newValue.substring(dollarPos + 1, newCursorPosition);
      const availableVars = getAvailableVariables();
      
      if (variableText.length >= 0) {
        const filteredVars = availableVars.filter(v => 
          v.name.toLowerCase().startsWith(variableText.toLowerCase())
        );
        
        if (filteredVars.length > 0) {
          setSuggestions(filteredVars);
          setShowSuggestions(true);
          setSelectedIndex(0);
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          selectVariable(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const selectVariable = (variable: Variable) => {
    const dollarPos = findDollarPosition(value, cursorPosition - 1);
    if (dollarPos !== -1) {
      const beforeDollar = value.substring(0, dollarPos);
      const afterCursor = value.substring(cursorPosition);
      const newValue = beforeDollar + '$' + variable.name + afterCursor;
      
      onChange(newValue);
      setShowSuggestions(false);
      
      // Đặt cursor sau tên biến
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = dollarPos + variable.name.length + 1;
          inputRef.current.setSelectionRange(newPosition, newPosition);
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  // Đóng suggestions khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string': return 'text-blue-600 bg-blue-50';
      case 'number': return 'text-green-600 bg-green-50';
      case 'boolean': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((variable, index) => (
            <div
              key={variable.name}
              className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 ${
                index === selectedIndex ? 'bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-500' : ''
              }`}
              onClick={() => selectVariable(variable)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Variable className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                    ${variable.name}
                  </div>
                  {variable.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {variable.description}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-1 rounded ${getTypeColor(variable.type)}`}>
                  {variable.type}
                </span>
                {index === selectedIndex && (
                  <Check className="h-4 w-4 text-purple-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
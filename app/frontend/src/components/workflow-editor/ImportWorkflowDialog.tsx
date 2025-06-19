import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImportWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (jsonData: string) => void;
}

const ImportWorkflowDialog: React.FC<ImportWorkflowDialogProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [jsonData, setJsonData] = useState('');
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const validateJSON = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.nodes || !parsed.edges) {
        return 'Invalid workflow format. Must contain "nodes" and "edges" properties.';
      }
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        return 'Invalid workflow format. "nodes" and "edges" must be arrays.';
      }
      return null;
    } catch (error) {
      return 'Invalid JSON format.';
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonData(content);
      setError('');
    };
    reader.readAsText(file);
  }, []);

  const handleImport = async () => {
    const validationError = validateJSON(jsonData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsImporting(true);
    try {
      onImport(jsonData);
      onClose();
      setJsonData('');
      setError('');
    } catch (error) {
      setError('Failed to import workflow. Please check the format.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonData(e.target.value);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Workflow</DialogTitle>
          <DialogDescription>
            Import a workflow from a JSON file or paste JSON data directly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Upload JSON File</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <span className="text-sm text-muted-foreground">
                Select a .json workflow file
              </span>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            — OR —
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="json-data">Paste JSON Data</Label>
            <Textarea
              id="json-data"
              value={jsonData}
              onChange={handleTextareaChange}
              placeholder='Paste workflow JSON data here...'
              className="font-mono text-sm h-40 resize-none"
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!jsonData.trim() || isImporting}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing...' : 'Import Workflow'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportWorkflowDialog;
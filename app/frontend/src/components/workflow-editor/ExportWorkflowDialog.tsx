import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ExportWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workflowData: string;
  workflowName: string;
}

const ExportWorkflowDialog: React.FC<ExportWorkflowDialogProps> = ({
  isOpen,
  onClose,
  workflowData,
  workflowName,
}) => {
  const [fileName, setFileName] = useState(`${workflowName || 'workflow'}.json`);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([workflowData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(workflowData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Workflow</DialogTitle>
          <DialogDescription>
            Export your workflow as a JSON file or copy to clipboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filename">File Name</Label>
            <Input
              id="filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="workflow.json"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Workflow Data Preview</Label>
            <Textarea
              value={workflowData}
              readOnly
              className="font-mono text-sm h-40 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleCopyToClipboard}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportWorkflowDialog;
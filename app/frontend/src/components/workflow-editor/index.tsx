// File: src/components/workflow-editor/index.tsx

import React from "react";
import {
  Undo, Redo, ArrowLeft, Save, Play, Upload, Download, Layout, Trash2,
} from "lucide-react";
import { WorkflowProvider, useWorkflowContext } from "../../context/WorkflowContext";
import AutomationCanvas from "./AutomationCanvas";
import NodePanel from "./NodePanel";
import NodeProperties from "./NodeProperties";
import VariableManager from "./VariableManager";
import ExportWorkflowDialog from "./ExportWorkflowDialog";
import ImportWorkflowDialog from "./ImportWorkflowDialog";
import { useWorkflowEditor } from "../../hooks/us/use-workflow-editor";
import { useBeforeUnload } from '../../hooks/us/useBeforeUnload'; // Import hook mới

interface WorkflowEditorProps {
  onBackToList: () => void;
  workflowId?: string;
  // Callback này không bắt buộc nhưng vẫn hữu ích nếu WorkflowPage cần làm gì đó sau khi lưu
  onSaveSuccess?: (savedWorkflow: any) => void;
}

const WorkflowEditorInner: React.FC<WorkflowEditorProps> = ({
  onBackToList,
  workflowId,
  onSaveSuccess,
}) => {
  // === 1. LẤY LOGIC TỪ HOOK "BRAIN" ===
  const {
    currentWorkflow,
    isEditingName,
    isLoading,
    handleSave,
    saveOnUnload, // Lấy hàm lưu đặc biệt cho việc reload
    handleStartEditingName,
    handleNameChange,
    handleNameBlur,
    handleKeyDown,
  } = useWorkflowEditor({ workflowId });

  // === 2. LẤY CÁC HÀM TỪ CONTEXT ===
  const { 
    undo, redo, autoLayout, deleteSelectedNodes, 
    exportWorkflow: exportWorkflowData, importWorkflow: importWorkflowData 
  } = useWorkflowContext();

  // === 3. XỬ LÝ AUTO-SAVE KHI RELOAD/CLOSE ===
  useBeforeUnload(() => {
    console.log('Before Unload event triggered! Saving work...');
    saveOnUnload();
  });

  // === 4. STATE VÀ HANDLER CỤC BỘ CHO UI ===
  const [showExportDialog, setShowExportDialog] = React.useState(false);
  const [showImportDialog, setShowImportDialog] = React.useState(false);

  // Handler cho nút Back: Sẽ thử lưu trước khi quay lại
  const handleAutoSaveAndBack = async () => {
    try {
      await handleSave();
    } catch (error) {
      console.error("Auto-save on back button failed", error);
    } finally {
      onBackToList();
    }
  };

  const handleExportWorkflow = () => setShowExportDialog(true);
  const handleImportWorkflow = () => setShowImportDialog(true);
  const handleExportClose = () => setShowExportDialog(false);
  const handleImportClose = () => setShowImportDialog(false);

  const handleImportData = (jsonData: string) => {
    try {
      importWorkflowData(jsonData);
      const data = JSON.parse(jsonData);
      if (data.metadata && data.metadata.name) {
        handleNameChange(data.metadata.name);
      }
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  };

  const executeWorkflow = () => console.log("Execute workflow");
  
  const editorRef = React.useRef<any>({ undo, redo, autoLayout, deleteSelectedNodes });

  return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleAutoSaveAndBack} // Dùng hàm auto-save
              className="p-2 hover:bg-gray-100 rounded-md text-gray-600"
              title="Back to workflows"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              {isEditingName ? (
                <input
                  type="text"
                  value={currentWorkflow.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={handleNameBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="bg-gray-100 text-lg px-2 py-1 rounded-md"
                />
              ) : (
                <h1
                  className="text-lg font-medium cursor-pointer"
                  onClick={handleStartEditingName}
                >
                  {isLoading ? 'Loading...' : currentWorkflow.name}
                </h1>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => editorRef.current.undo()} className="p-2" title="Undo"><Undo className="h-4 w-4" /></button>
            <button onClick={() => editorRef.current.redo()} className="p-2" title="Redo"><Redo className="h-4 w-4" /></button>
            <div className="w-px h-5 bg-gray-200 mx-1"></div>
            <button onClick={() => editorRef.current.autoLayout()} className="p-2" title="Auto Layout"><Layout className="h-4 w-4" /></button>
            <button onClick={() => editorRef.current.deleteSelectedNodes()} className="p-2" title="Delete Selected"><Trash2 className="h-4 w-4" /></button>
            <div className="w-px h-5 bg-gray-200 mx-1"></div>
            <button onClick={handleSave} disabled={isLoading} className="p-2 disabled:opacity-50" title="Save workflow"><Save className="h-4 w-4" /></button>
            <button onClick={handleExportWorkflow} className="p-2" title="Export"><Download className="h-4 w-4" /></button>
            <button onClick={handleImportWorkflow} className="p-2" title="Import"><Upload className="h-4 w-4" /></button>
            <button onClick={executeWorkflow} className="px-3 py-1.5 flex items-center gap-1.5 bg-green-600 hover:bg-green-500 rounded-md text-white text-sm">
              <Play className="h-3.5 w-3.5" /> Run
            </button>
          </div>
        </div>
        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="w-48 border-r bg-white"><NodePanel /></div>
          <div className="flex-1"><AutomationCanvas editorRef={editorRef} /></div>
          <div className="w-80 border-l bg-white flex flex-col">
            <div className="flex-1"><NodeProperties /></div>
            <div className="h-80 border-t"><VariableManager /></div>
          </div>
        </div>
        {/* Dialogs */}
        <ExportWorkflowDialog isOpen={showExportDialog} onClose={handleExportClose} workflowData={exportWorkflowData()} workflowName={currentWorkflow.name} />
        <ImportWorkflowDialog isOpen={showImportDialog} onClose={handleImportClose} onImport={handleImportData} />
      </div>
  );
};

const WorkflowEditor: React.FC<WorkflowEditorProps> = (props) => {
  return (
    <WorkflowProvider>
      <WorkflowEditorInner {...props} />
    </WorkflowProvider>
  );
};

export default WorkflowEditor;
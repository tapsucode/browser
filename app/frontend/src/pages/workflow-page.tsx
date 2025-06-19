import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import WorkflowEditor from '../components/workflow-editor';
import WorkflowList from '../components/workflow-editor/WorkflowList'; // Giả sử đây là đường dẫn đúng
import { WorkflowRunDialog, RunPayload } from '../components/workflow-editor/workflow-run-dialog'; // Giả sử đây là đường dẫn đúng
import { useWorkflow } from '../hooks/us/useWorkflow'; // Giả sử đây là đường dẫn đúng
import { useProfile } from '../hooks/us/useProfile';

enum WorkflowView {
  LIST = 'list',
  EDITOR = 'editor'
}

// Giả định một kiểu Workflow cơ bản để tương thích với WorkflowList
// Bạn nên định nghĩa kiểu này ở một file chung (ví dụ: types.ts)
interface Workflow {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isRunning?: boolean; // Tạm thời vẫn giữ, sẽ được xử lý sau
}

export default function WorkflowPage() {
  // Sử dụng hook để quản lý workflow
  const {
    workflows, // CHANGED: Lấy workflows từ hook
    isLoadingWorkflows,
    duplicateWorkflow,
    deleteWorkflow, // ADDED: Lấy hàm deleteWorkflow
  } = useWorkflow();

  const {
    profiles,
    groups,
    isLoadingProfiles,
    isLoadingGroups,
    launchProfileWithWorkflow, // Lấy trực tiếp từ useProfile
    launchGroupWithWorkflow,   // Lấy trực tiếp từ useProfile
  } = useProfile(""); // selectedVendorId có thể không cần thiết cho các hành động này
  // Quản lý trạng thái local của trang
  const [currentView, setCurrentView] = useState<WorkflowView>(WorkflowView.LIST);
  const [currentWorkflow, setCurrentWorkflow] = useState<any | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false);

  // Handler tạo workflow mới
  const handleCreateWorkflow = () => {
    setCurrentWorkflow(null);
    setCurrentView(WorkflowView.EDITOR);
  };

  const handleEditWorkflow = (workflowId: string) => {
    // Tìm đối tượng workflow đầy đủ trong danh sách dựa trên ID
    const workflowToEdit = workflows.find(wf => wf.id === workflowId);

    if (workflowToEdit) {
      setCurrentWorkflow(workflowToEdit); // Lưu toàn bộ đối tượng vào state
      setCurrentView(WorkflowView.EDITOR);
    } else {
      // Xử lý trường hợp không tìm thấy workflow (dù hiếm khi xảy ra)
      console.error("Could not find the workflow to edit with ID:", workflowId);
    }
  };

  // Handler chạy workflow
  const handleRunWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setIsRunDialogOpen(true);
  };

  // Handler xóa workflow
  const handleDeleteWorkflow = (workflowId: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(workflowId);
    }
  };

  const handleDuplicateWorkflow = (workflowId: string) => {
    // Bạn có thể thêm một cửa sổ xác nhận ở đây nếu muốn
    if (window.confirm('Do you want to create a copy of this workflow?')) {
      duplicateWorkflow(workflowId);
    }
  };

  // Handler quay lại danh sách
  const handleBackToList = () => {
    setCurrentView(WorkflowView.LIST);
    setCurrentWorkflow(null);
  };

  const handleStopWorkflow = (workflowId: string) => {
    console.log("Stop workflow clicked for ID:", workflowId);
    // TODO: Implement actual stop workflow logic
    alert("Stop workflow functionality will be implemented later");
  };

  // Handler thực thi workflow
  // const handleExecuteWorkflow = (workflowId: string, profileIds: string[], threads: number) => {
  //   executeWorkflow(workflowId, profileIds, threads);
  //   setIsRunDialogOpen(false);
  // };

  const handleExecuteWorkflow = (payload: RunPayload) => {
    if (!selectedWorkflow) {
      console.error("No workflow selected to run.");
      return;
    }

    // Phân loại payload và gọi đúng hàm mutation từ useProfile
    if (payload.mode === 'profiles') {
      // Chạy trên từng profile một
      payload.profileIds.forEach(profileId => {
        launchProfileWithWorkflow({
          profileId: profileId,
          workflowId: selectedWorkflow.id
        });
      });
    } else if (payload.mode === 'group') {
      // Chạy theo group
      launchGroupWithWorkflow({
        groupId: payload.groupId,
        workflowId: selectedWorkflow.id,
        threads: payload.threads
      });
    }

    // Đóng dialog sau khi đã gọi mutation
    setIsRunDialogOpen(false);
  };

  // Hiển thị loading indicator khi đang tải dữ liệu
  if (isLoadingWorkflows) {
    return <div className="p-6">Loading workflows...</div>;
  }

  return (
    <div className="h-screen bg-white text-gray-800">
      {currentView === WorkflowView.LIST ? (
        <WorkflowList
          workflows={workflows} // CHANGED: Truyền workflows thật
          onCreateNew={handleCreateWorkflow}
          onStopWorkflow={handleStopWorkflow}
          onEdit={handleEditWorkflow}
          onRunWorkflow={handleRunWorkflow}
          onDelete={handleDeleteWorkflow}
          onDuplicate={handleDuplicateWorkflow} // ADDED: Truyền hàm delete
        />
      ) : (
        <ReactFlowProvider>

          <WorkflowEditor
            onBackToList={handleBackToList}
            workflowId={currentWorkflow?.id}
          />
        </ReactFlowProvider>
      )}

      {selectedWorkflow && (
        <WorkflowRunDialog
          open={isRunDialogOpen}
          onOpenChange={setIsRunDialogOpen}
          workflow={selectedWorkflow}
          // Truyền profiles và groups xuống dialog
          profiles={profiles}
          groups={groups}
          // Truyền hàm điều phối đã được cập nhật
          onRun={handleExecuteWorkflow}
        />
      )}
    </div>
  );
}
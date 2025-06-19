import React, { useState } from "react";
import { Plus, Edit, Trash, Play, Copy, Power } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Kiểu Workflow này nên được định nghĩa ở một nơi chung và import vào
interface Workflow {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isRunning?: boolean; // Thuộc tính này có thể không tồn tại trên dữ liệu backend, cần xử lý
}

interface WorkflowListProps {
  workflows: Workflow[]; // ADDED: Nhận workflows từ props
  onCreateNew: () => void;
  onEdit: (workflowId: string) => void;
  onRunWorkflow: (workflow: Workflow) => void;
  onDelete: (workflowId: string) => void; // ADDED: Nhận hàm delete từ props
  onStopWorkflow?: (workflowId: string) => void;
  onDuplicate: (workflowId: string) => void;
}

const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows, // CHANGED
  onCreateNew,
  onEdit,
  onRunWorkflow,
  onDelete, // CHANGED
  onStopWorkflow,
  onDuplicate, // THÊM: Nhận hàm duplicate từ props
}) => {
  // REMOVED: Không dùng state và dữ liệu mẫu nữa
  // const [workflows, setWorkflows] = useState<Workflow[]>(sampleWorkflows);
  const [searchQuery, setSearchQuery] = useState("");

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // CHANGED: Hàm delete giờ sẽ gọi prop từ component cha
  const handleDelete = (id: string) => {
    onDelete(id);
  };

  const handleDuplicate = (workflow: Workflow) => {

    onDuplicate(workflow.id);
  };

  // Filter workflows based on search query
  const filteredWorkflows = workflows.filter(
    (workflow) =>
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (workflow.description &&
        workflow.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer position="bottom-right" theme="light" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Automation Workflows
        </h1>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white text-sm transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create New Workflow
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search workflows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        />
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredWorkflows.length > 0 ? (
              filteredWorkflows.map((workflow) => (
                <tr
                  key={workflow.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {workflow.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {workflow.description || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {formatDate(workflow.updatedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      workflow.isRunning 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      <div className={`h-2 w-2 mr-1.5 rounded-full ${
                        workflow.isRunning ? "bg-green-400" : "bg-gray-400"
                      }`}></div>
                      {workflow.isRunning ? "Running" : "Stopped"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {/* Các nút hành động khác sẽ được triển khai sau */}

                      <button
                        onClick={() => onEdit(workflow.id)} // Sửa: gọi onEdit với toàn bộ object workflow
                        className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors shadow-sm"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(workflow)}
                        className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded transition-colors shadow-sm"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {!workflow.isRunning ? (
                        <button
                          onClick={() => onRunWorkflow(workflow)}
                          className="p-1.5 bg-green-100 text-green-600 hover:bg-green-200 rounded transition-colors shadow-sm"
                          title="Run"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onStopWorkflow?.(workflow.id)}
                          className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors shadow-sm"
                          title="Stop"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(workflow.id)}
                        className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors shadow-sm"
                        title="Delete"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  {searchQuery
                    ? "No workflows match your search"
                    : "No workflows yet. Create one to get started!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkflowList;

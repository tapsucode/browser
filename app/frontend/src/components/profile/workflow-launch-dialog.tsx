// File: src/components/workflow-launch-dialog.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play } from "lucide-react";

// Dữ liệu mẫu, bạn sẽ truyền từ props vào
export interface Workflow {
  id: string;
  name: string;
}

// Payload mà dialog sẽ trả về khi submit
export interface LaunchPayload {
  profileIds: string[];
  workflowId: string | null; // null nếu không chọn workflow
  threads: number;
}

interface WorkflowLaunchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLaunch: (payload: LaunchPayload) => void;
  profileIds: string[]; // Các profile ID đang được nhắm đến
  workflows: Workflow[]; // Danh sách workflow để chọn
}

export function WorkflowLaunchDialog({
  open,
  onOpenChange,
  onLaunch,
  profileIds,
  workflows,
}: WorkflowLaunchDialogProps) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(""); // Rỗng nghĩa là chưa chọn
  const [threads, setThreads] = useState<number>(1);
  const isSingleProfile = profileIds.length === 1;

  // Cập nhật số luồng khi số lượng profile thay đổi
  useEffect(() => {
    if (open) { // Chỉ cập nhật khi dialog mở
      setThreads(isSingleProfile ? 1 : Math.min(profileIds.length, 5)); // Mặc định là 5 hoặc ít hơn
    }
  }, [profileIds, isSingleProfile, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: LaunchPayload = {
      profileIds: profileIds,
      // Nếu người dùng chọn 'none', workflowId sẽ là null
      workflowId: selectedWorkflowId === 'none' ? null : selectedWorkflowId,
      threads: threads,
    };
    onLaunch(payload);
  };

  // Reset state khi dialog đóng
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => {
        setSelectedWorkflowId("");
      }, 150);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Launch Profiles</DialogTitle>
          <DialogDescription>
            {isSingleProfile
              ? "Configure launch options for the selected profile."
              : `Configure launch options for ${profileIds.length} selected profiles.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="workflow">Select Workflow (Optional)</Label>
            <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
              <SelectTrigger id="workflow">
                <SelectValue placeholder="Run without workflow" />
              </SelectTrigger>
              <SelectContent>
                {/* Lựa chọn "None" */}
                <SelectItem value="none">None - Launch Profile Only</SelectItem>
                {/* Render danh sách workflow */}
                {workflows.map((workflow) => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isSingleProfile && (
            <div className="space-y-2">
              <Label htmlFor="threads">Concurrent Threads</Label>
              <Input
                id="threads"
                type="number"
                min={1}
                max={Math.max(1, profileIds.length)}
                value={threads}
                onChange={(e) => setThreads(Number(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Number of profiles to run concurrently.
              </p>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Play className="mr-2 h-4 w-4" />
              Launch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
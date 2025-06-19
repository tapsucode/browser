// Đường dẫn: src/components/workflow-editor/workflow-run-dialog.tsx

import React, { useState, useMemo } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, User, Users, AlertTriangle, Search } from "lucide-react";

// 1. ĐỊNH NGHĨA CÁC KIỂU DỮ LIỆU CẦN THIẾT
export interface Profile {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  profileCount?: number;
}

export type RunPayload =
  | { mode: 'profile'; profileId: string }
  | { mode: 'group'; groupId: string; threads: number };

interface WorkflowRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRun: (payload: RunPayload) => void;
  workflow: { id: string; name: string };
  profiles: Profile[];
  groups: Group[];
}


// 2. COMPONENT CHÍNH
export function WorkflowRunDialog({
  open,
  onOpenChange,
  onRun,
  workflow,
  profiles,
  groups,
}: WorkflowRunDialogProps) {
  // === State quản lý toàn bộ dialog ===
  const [runMode, setRunMode] = useState<'profile' | 'group'>('profile');
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [threads, setThreads] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState("");

  // Memoize để tối ưu việc lọc profile khi tìm kiếm
  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles;
    return profiles.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [profiles, searchQuery]);

  // === Các hàm xử lý ===

  // Xử lý khi nhấn nút "Run Workflow"
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (runMode === 'profile' && selectedProfileId) {
      onRun({ mode: 'profile', profileId: selectedProfileId });
    } else if (runMode === 'group' && selectedGroupId) {
      onRun({ mode: 'group', groupId: selectedGroupId, threads });
    }
    onOpenChange(false); // Đóng dialog sau khi submit
  };
  
  // Reset tất cả state khi dialog đóng
  const resetState = () => {
    setRunMode('profile');
    setSelectedProfileId("");
    setSelectedGroupId("");
    setThreads(5);
    setSearchQuery("");
  };

  // Điều kiện để bật/tắt nút Run
  const isRunDisabled =
    (runMode === 'profile' && !selectedProfileId) ||
    (runMode === 'group' && !selectedGroupId);


  // === Giao diện JSX ===
  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState) => {
        if (!newOpenState) {
          resetState(); // Gọi hàm reset khi dialog đóng
        }
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Run Workflow: {workflow?.name}</DialogTitle>
          <DialogDescription>
            Choose how you want to execute this workflow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Lựa chọn chế độ: Profile hoặc Group */}
          <RadioGroup value={runMode} onValueChange={(value) => setRunMode(value as 'profile' | 'group')} className="grid grid-cols-2 gap-4">
            <div>
              <RadioGroupItem value="profile" id="r-profile" className="sr-only" />
              <Label htmlFor="r-profile" className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${runMode === 'profile' ? 'border-primary' : 'border-muted'}`}>
                <User className="mb-3 h-6 w-6" />
                Run on Profile
              </Label>
            </div>
            <div>
              <RadioGroupItem value="group" id="r-group" className="sr-only" />
              <Label htmlFor="r-group" className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${runMode === 'group' ? 'border-primary' : 'border-muted'}`}>
                <Users className="mb-3 h-6 w-6" />
                Run on Group
              </Label>
            </div>
          </RadioGroup>

          {/* Hiển thị UI tương ứng với chế độ đã chọn */}
          {runMode === 'profile' ? (
            <div className="space-y-2">
              <Label>Select a Profile</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search profile..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <ScrollArea className="h-48 w-full rounded-md border">
                <div className="p-2">
                  <RadioGroup value={selectedProfileId} onValueChange={setSelectedProfileId}>
                    {filteredProfiles.length > 0 ? (
                      filteredProfiles.map((profile) => (
                        <Label
                          key={profile.id}
                          htmlFor={profile.id}
                          className={`flex items-center gap-3 rounded-md p-2 cursor-pointer border-2 ${selectedProfileId === profile.id ? 'border-primary' : 'border-transparent'}`}
                        >
                          <RadioGroupItem value={profile.id} id={profile.id} />
                          <span className="font-medium">{profile.name}</span>
                        </Label>
                      ))
                    ) : (
                      <p className="p-4 text-center text-sm text-muted-foreground">No profiles found.</p>
                    )}
                  </RadioGroup>
                </div>
              </ScrollArea>
            </div>
          ) : ( // runMode === 'group'
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Group</Label>
                {groups?.length > 0 ? (
                  <Select onValueChange={setSelectedGroupId} value={selectedGroupId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group to run on" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} ({group.profileCount || 0} profiles)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-yellow-600 flex items-center gap-2 p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                    <AlertTriangle className="h-4 w-4" />
                    <span>No groups available. Please create a group first.</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="threads">Concurrent Threads</Label>
                <Input id="threads" type="number" min={1} max={50} value={threads} onChange={(e) => setThreads(Number(e.target.value))} />
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isRunDisabled} className="gap-2">
              <Play className="h-4 w-4" />
              Run Workflow
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
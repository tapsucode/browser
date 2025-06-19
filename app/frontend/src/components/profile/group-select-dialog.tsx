import React, { useState } from "react";
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
import { AlertTriangle, Plus, Users } from "lucide-react";

export interface Group {
  id: string;
  name: string;
  description?: string;
  profileCount?: number;
}

export interface AddToGroupPayload {
  mode: 'existing' | 'new';
  groupId: string | null;
  newGroupName: string | null;
  itemIds: string[]; // Dùng tên chung `itemIds` thay vì `profileIds`
}

interface GroupSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToGroup: (payload: AddToGroupPayload) => void;
  profileIds: string[];
  groups: Group[];
}

export function GroupSelectDialog({
  open,
  onOpenChange,
  onAddToGroup,
  profileIds,
  groups,
}: GroupSelectDialogProps) {
  const [selectedOption, setSelectedOption] = useState<"existing" | "new">("existing");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Chuẩn bị một "báo cáo" duy nhất và đầy đủ
    const payload: AddToGroupPayload = {
        mode: selectedOption,
        groupId: selectedOption === "existing" ? selectedGroupId : null,
        newGroupName: selectedOption === "new" ? newGroupName.trim() : null,
        // Lấy đúng mảng ID từ props
        itemIds: profileIds, 
    };

    // Gửi "báo cáo" hoàn chỉnh về cho component cha
    onAddToGroup(payload);
    
    // Đóng dialog sau khi gửi
    onOpenChange(false);
};

  const resetState = () => {
    setSelectedOption("existing");
    setSelectedGroupId("");
    setNewGroupName("");
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) resetState();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Group</DialogTitle>
          <DialogDescription>
            {profileIds.length > 1
              ? `Add ${profileIds.length} selected profiles to a group`
              : "Add the selected profile to a group"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <RadioGroup
            value={selectedOption}
            onValueChange={(value) => setSelectedOption(value as "existing" | "new")}
            className="space-y-4"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing" className="font-medium">
                  Select existing group
                </Label>
              </div>
              
              <div className="pl-6">
                <div className="space-y-2">
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <div 
                        key={group.id}
                        className={`p-3 border rounded-md cursor-pointer flex justify-between items-center ${
                          selectedOption === "existing" && selectedGroupId === group.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200"
                        }`}
                        onClick={() => {
                          setSelectedOption("existing");
                          setSelectedGroupId(group.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{group.name}</p>
                            {group.description && (
                              <p className="text-xs text-gray-500">{group.description}</p>
                            )}
                          </div>
                        </div>
                        {group.profileCount !== undefined && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {group.profileCount} {group.profileCount === 1 ? "profile" : "profiles"}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>No existing groups found</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="font-medium">
                  Create a new group
                </Label>
              </div>
              
              <div className="pl-6">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Group name</Label>
                  <Input
                    id="groupName"
                    placeholder="Enter group name"
                    value={newGroupName}
                    onChange={(e) => {
                      setNewGroupName(e.target.value);
                      setSelectedOption("new");
                    }}
                    onClick={() => setSelectedOption("new")}
                  />
                </div>
              </div>
            </div>
          </RadioGroup>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                (selectedOption === "existing" && !selectedGroupId) ||
                (selectedOption === "new" && !newGroupName.trim())
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
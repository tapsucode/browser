import React, { useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ProfileModal } from "../components/profile-modal";
import { ProfileList } from "../components/profile/profile-list";
import { WorkflowLaunchDialog, LaunchPayload } from "../components/profile/workflow-launch-dialog";
import { GroupSelectDialog, AddToGroupPayload } from "../components/profile/group-select-dialog";
import { ExportProfileDialog } from "../components/profile/export-profile-dialog";
import { ImportProfilesDialog, ImportPayload } from "../components/profile/import-profiles-dialog";
import { CreateProfileData } from '../lib/types';
import { useWorkflow } from "../hooks/us/useWorkflow";
// import { ProfileSettingsDialog } from "../components/profile/settings-dialog";
// Sử dụng hook tích hợp useProfilePage thay cho các hook riêng biệt
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Search,
  Filter,
  UserPlus,
  Plus,
  UploadCloud,
  DownloadCloud,
  Settings,
  MoreHorizontal,
  CheckCircle,
  Shield,
  UserCheck,
  Chrome,
  Earth,
  CreditCard,
  Play,
  Users,
  Trash,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuth } from "../hooks/us/useAuth";
import { useState } from "react";
import { useProfile } from "../hooks/us/useProfile";
import { useProxy } from "../hooks/us/useProxy";

export default function ProfilePage() {
  const { user } = useAuth();

  // Import useProxy hook
  const {
    proxies,
    isLoadingProxies,
    createProxy,
    updateProxy,
    deleteProxy,
    testProxy,
    proxyGroups,
    isLoadingProxyGroups,
  } = useProxy();

  // Tạo form để quản lý giá trị proxy
  const form = useForm({
    defaultValues: {
      proxyHost: "",
      proxyUsername: "",
      proxyPassword: "",
      proxyId: ""
    }
  });

  const [selectedVendorId, setSelectedVendorId] = useState<string>("");

  // Sử dụng hook theo tính năng thay vì hook theo page  
  const {
    // Data queries
    profiles,
    groups,
    isLoadingProfiles,
    isLoadingGroups,

    // Mutations
    createProfile,
    createProfileAsync,
    updateProfile,
    deleteProfile,
    launchProfile,
    launchProfiles,
    launchProfileWithWorkflow,
    launchProfilesWithWorkflow,
    exportProfile,
    importProfiles,
    addProfilesToGroup,
    createGroup,


    // Mutation states
    isCreatingProfile,
    isUpdatingProfile,
    isDeletingProfile,
    isLaunchingProfile,
    isExportingProfile,
    isImportingProfiles,
    isAddingProfilesToGroup,
    isLoadingFingerprint,
    renderers,
    userAgents,
    vendors,
    hardwareConcurrency,
    deviceMemory,
    resolutions,
    browserLanguages
  } = useProfile(selectedVendorId);

  const isLoadingVendors = isLoadingFingerprint;
  const isLoadingRenderers = isLoadingFingerprint;

  const {
    workflows,
    isLoadingWorkflows
  } = useWorkflow();

  // Local state - specific cho ProfilePage UI
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportProfilesOpen, setIsImportProfilesOpen] = useState(false);
  // const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLaunchWorkflowOpen, setIsLaunchWorkflowOpen] = useState(false);
  const [isExportProfileOpen, setIsExportProfileOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);


  const [isWorkflowDialogOpen, setIsWorkflowDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("individual");
  const [showCustomWebRtcIp, setShowCustomWebRtcIp] = useState(false);
  const [initialProfileData, setInitialProfileData] = useState<Partial<any> | null>(null);
  const [isLaunchDialogOpen, setIsLaunchDialogOpen] = useState(false);
  const [launchTargetIds, setLaunchTargetIds] = useState<string[]>([]); // Lưu các ID đang định launch

  // Dữ liệu mẫu cho Activities và Workflows (sẽ được thay thế bằng hooks tương ứng sau)
  const activities: any[] = [];


  // Handler functions - bọc lại các hàm từ hook useProfile thích hợp
  const handleCreateProfile = (profileData: CreateProfileData) => {
    // Chỉ cần gọi hàm mutate từ hook useProfile
    return createProfileAsync(profileData);
  };

  const handleUpdateProfile = (id: string, data: any) => {
    updateProfile({ id, data });
  };

  const handleDeleteProfile = (id: string) => {
    deleteProfile(id);
  };

  const handleQuickLaunchProfile = (profileId: string) => {
    launchProfile(profileId);
  };

  const handleOpenLaunchDialog = (profileIds: string[]) => {
    if (profileIds.length > 0) {
      setLaunchTargetIds(profileIds);
      setIsLaunchDialogOpen(true);
    }
  };
  // HÀM ĐIỀU PHỐI - Trái tim của giải pháp
  // Được gọi khi người dùng submit từ WorkflowLaunchDialog
  const handleLaunchSubmit = (payload: LaunchPayload) => {
    const { profileIds, workflowId, threads } = payload;

    console.log("Dispatching launch with payload:", payload);

    // Phân loại và gọi hook tương ứng
    if (workflowId) {
      // CÓ WORKFLOW
      if (profileIds.length === 1) {
        // Kịch bản 3: Chạy 1 profile với workflow
        launchProfileWithWorkflow({ profileId: profileIds[0], workflowId });
      } else {
        // Kịch bản 4: Chạy nhiều profile với workflow
        launchProfilesWithWorkflow({ profileIds, workflowId, threads });
      }
    } else {
      // KHÔNG CÓ WORKFLOW
      if (profileIds.length === 1) {
        // Kịch bản 1: Chạy 1 profile
        launchProfile(profileIds[0]);
      } else {
        // Kịch bản 2: Chạy nhiều profile
        launchProfiles({ profileIds, threads });
      }
    }

    // Đóng dialog sau khi gọi
    setIsLaunchDialogOpen(false);
  };

  const handleExportProfile = (id: string) => {
    exportProfile(id);
  };

  const handleAddToGroup = (payload: AddToGroupPayload) => {
    addProfilesToGroup(payload, {
      onSuccess: () => {
        setIsGroupDialogOpen(false);
        setSelectedProfileIds([]);
      },
    });
  };

  const handleLaunchWorkflow = (
    workflowId: string,
    profileIds: string[],
    threads: number,
  ) => {
    // Sẽ được thực hiện bởi hook workflow
    console.log("Launch workflow", workflowId, profileIds, threads);
  };

  const handleImportProfiles = async (payload: ImportPayload) => {

    importProfiles(payload, {
      onSuccess: () => {
        setIsImportProfilesOpen(false);
      }
    });
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedProfileIds(selectedIds);
  };

  const handleOpenGroupDialog = () => {
    if (selectedProfileIds.length > 0) {
      setIsGroupDialogOpen(true);
    }
  };

  // Object profilePage cho backward compatibility
  const profilePage = {
    onProfileModalOpen: () => setIsProfileModalOpen(true),
    onProfileModalOpenChange: setIsProfileModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    initialProfileData,
    setInitialProfileData,
    activeTab,
    setActiveTab,
    selectedVendorId,
    showCustomWebRtcIp,
    handleVendorChange: (vendorId: string) => {
      setSelectedVendorId(vendorId);
    },
    handleWebRtcChange: (value: string) => setShowCustomWebRtcIp(value === 'custom'),
    vendors,
    renderers,
    proxyGroups,
    userAgents,
    isLoadingVendors,
    isLoadingRenderers,
    isLoadingProxyGroups,
    hardwareConcurrency,
    deviceMemory,
    resolutions,
    browserLanguages,
    handleCreateProfile,
    handleUpdateProfile
  };

  // Add event listener to open profile modal from sidebar
  useEffect(() => {
    const handleOpenProfileModal = () => {
      profilePage.onProfileModalOpen();
    };

    document.addEventListener("openProfileModal", handleOpenProfileModal);

    return () => {
      document.removeEventListener("openProfileModal", handleOpenProfileModal);
    };
  }, [profilePage.onProfileModalOpen]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Browser Profiles</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search profiles..."
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsImportProfilesOpen(true)}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Import
          </Button>
          {/* <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button> */}
          <Button onClick={() => profilePage.onProfileModalOpen()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{profiles.length}</div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">
                {profiles.filter((p) => p.status === "active").length}
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Chrome className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Connected Proxies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">
                {profiles.filter((p) => p.proxyStatus === "connected").length}
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Earth className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      <div className="flex flex-col gap-6">
        {/* Hàng 1: ProfileList chiếm toàn bộ chiều ngang */}
        <div>
          <ProfileList
            profiles={profiles}
            selectedProfiles={selectedProfileIds}
            onAddToGroup={handleOpenGroupDialog}
            isLoading={isLoadingProfiles}
            onQuickLaunch={handleQuickLaunchProfile}
            onBulkLaunch={() => handleOpenLaunchDialog(selectedProfileIds)}
            onEdit={(profile) => {
              profilePage.setInitialProfileData(profile);
              profilePage.onProfileModalOpen();
            }}
            onDelete={handleDeleteProfile}
            onExport={handleExportProfile}
            onSelectionChange={handleSelectionChange}

            onGroupAdd={() => {
              if (selectedProfileIds.length > 0) {
                setIsGroupDialogOpen(true);
              }
            }}
            onLaunchWorkflow={() => {
              if (selectedProfileIds.length > 0) {
                setIsLaunchWorkflowOpen(true);
              }
            }}
          />
        </div>

        {/* Hàng 2: Lưới 3 cột chứa 3 thẻ còn lại */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${activity.type === "login"
                        ? "bg-green-100"
                        : activity.type === "proxy"
                          ? "bg-blue-100"
                          : "bg-purple-100"
                        }`}
                    >
                      {activity.type === "login" ? (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      ) : activity.type === "proxy" ? (
                        <Earth className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Chrome className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groups.length === 0 ? (
                  <p className="text-sm text-gray-500">No groups created yet</p>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{group.name}</p>
                        <p className="text-xs text-gray-500">
                          {group.profileCount || 0} profiles
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Profile Slots</span>
                    <span className="text-sm text-gray-500">
                      {profiles.length}/50
                    </span>
                  </div>
                  <Progress
                    value={(profiles.length / 50) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Active Sessions</span>
                    <span className="text-sm text-gray-500">
                      {profiles.filter((p) => p.status === "active").length}/20
                    </span>
                  </div>
                  <Progress
                    value={
                      (profiles.filter((p) => p.status === "active").length /
                        20) *
                      100
                    }
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Storage Used</span>
                    <span className="text-sm text-gray-500">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProfileModal
        // Modal state
        isOpen={profilePage.isProfileModalOpen}
        onOpenChange={profilePage.onProfileModalOpenChange}
        initialProfileData={profilePage.initialProfileData}
        // Modal UI state
        activeTab={profilePage.activeTab}
        setActiveTab={profilePage.setActiveTab}
        selectedVendorId={profilePage.selectedVendorId}
        showCustomWebRtcIp={profilePage.showCustomWebRtcIp}
        // Handlers
        handleVendorChange={profilePage.handleVendorChange}
        handleWebRtcChange={profilePage.handleWebRtcChange}
        // Data
        vendors={profilePage.vendors || []}
        renderers={profilePage.renderers || []}
        proxyGroups={profilePage.proxyGroups || []}
        userAgents={profilePage.userAgents || []}
        hardwareConcurrency={profilePage.hardwareConcurrency || []}
        deviceMemory={profilePage.deviceMemory || []}
        resolutions={profilePage.resolutions || []}
        browserLanguages={profilePage.browserLanguages || []}
        // Form
        
        // Loading states
        isLoadingVendors={profilePage.isLoadingVendors || false}
        isLoadingRenderers={profilePage.isLoadingRenderers || false}
        isLoadingProxyGroups={profilePage.isLoadingProxyGroups || false}
        // Proxy data & actions
        // Actions
        onCreate={profilePage.handleCreateProfile}

        onUpdate={(id: string, data: any) => profilePage.handleUpdateProfile(id, data)}
      />

      <ImportProfilesDialog
        open={isImportProfilesOpen}
        onOpenChange={setIsImportProfilesOpen}
        onImport={handleImportProfiles}
        isImporting={isImportingProfiles}
      />

      <ExportProfileDialog
        open={isExportProfileOpen}
        onOpenChange={setIsExportProfileOpen}
      />


      <WorkflowLaunchDialog
        open={isLaunchDialogOpen}
        onOpenChange={setIsLaunchDialogOpen}
        onLaunch={handleLaunchSubmit}
        profileIds={launchTargetIds}
        workflows={workflows}
      />

      <GroupSelectDialog
        open={isGroupDialogOpen}
        onOpenChange={setIsGroupDialogOpen}
        onAddToGroup={handleAddToGroup}
        profileIds={selectedProfileIds}
        groups={groups}
      />
    </>
  );
}
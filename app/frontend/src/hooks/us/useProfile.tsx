import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ProfileFunctionalService } from '../../lib/new/ProfileFunctionalService';
import { Profile, CreateProfileData, UpdateProfileData, CreateGroupData, UpdateGroupData } from '../../lib/types';
import { useToast } from '../use-toast';
import { queryClient } from '../../lib/queryClient';
import { type AddToGroupPayload } from "../../components/profile/group-select-dialog";

/**
 * Hook chức năng để quản lý profiles
 * Hook này được sử dụng trong:
 * - ProfilePage
 * - WorkflowPage
 * - Và các page khác cần hiển thị/sử dụng profile
 */
export function useProfile(selectedVendorId: string) {
  const { toast } = useToast();

  // Fetch tất cả profiles
  const {
    data: profiles = [],
    isLoading: isLoadingProfiles,
    error: profilesError,
    refetch: refetchProfiles
  } = useQuery({
    queryKey: ['/api/local/standard/profiles'],
    queryFn: () => ProfileFunctionalService.getProfiles(),
  });

  // Tạo danh sách profiles cơ bản (cho dropdown, list view)
  const basicProfiles = useMemo(() => {
    return profiles.map(profile => ProfileFunctionalService.getBasicProfileInfo(profile));
  }, [profiles]);

  // Fetch tất cả groups
  const {
    data: groups = [],
    isLoading: isLoadingGroups,
    error: groupsError,
    refetch: refetchGroups
  } = useQuery({
    queryKey: ['/api/local/standard/profiles/groups'],
    queryFn: () => ProfileFunctionalService.getGroups(),
  });

  // Fetch vendors
  const { data: fingerprintData, isLoading: isLoadingFingerprint } = useQuery({
        queryKey: ['fingerprint-data'], // Một query key duy nhất
        queryFn: () => ProfileFunctionalService.getFingerprintData(),
    });

    // 2. Sử dụng useMemo để trích xuất và ghi nhớ các phần dữ liệu con
    //    Điều này tránh tính toán lại không cần thiết khi component re-render.
    const vendors = useMemo(() => fingerprintData?.vendors || [], [fingerprintData]);
    const userAgents = useMemo(() => fingerprintData?.userAgents || [], [fingerprintData]);
    const hardwareConcurrency = useMemo(() => fingerprintData?.hardwareConcurrency || [], [fingerprintData]);
    const deviceMemory = useMemo(() => fingerprintData?.deviceMemory || [], [fingerprintData]);
    const resolutions = useMemo(() => fingerprintData?.resolutions || [], [fingerprintData]);
    const browserLanguages = useMemo(() => fingerprintData?.browserLanguages || [], [fingerprintData]);

    const renderers = useMemo(() => {
      if (fingerprintData && selectedVendorId) {
          return fingerprintData.renderers?.[selectedVendorId] || [];
      }
      return [];
  }, [fingerprintData, selectedVendorId]); // <-- Mảng phụ thuộc đã thay đổi


  // Lấy chi tiết profile cụ thể
  const getProfileDetails = (profileId: string) => {
    return useQuery({
      queryKey: ['/api/local/standard/profiles', profileId],
      queryFn: () => ProfileFunctionalService.getProfileById(profileId),
      enabled: !!profileId, // Chỉ gọi khi có profileId
    });
  };

  // Lấy profiles trong một group
  const getProfilesInGroup = (groupId: string) => {
    return useQuery({
      queryKey: ['/api/local/standard/profiles/groups', groupId, 'profiles'],
      queryFn: () => ProfileFunctionalService.getProfilesInGroup(groupId),
      enabled: !!groupId, // Chỉ gọi khi có groupId
    });
  };

  // Mutation tạo profile mới
  const createProfileMutation = useMutation({
    mutationFn: async (profileData: CreateProfileData) => {
      // Validate proxy group if selected
      return ProfileFunctionalService.createProfile(profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/profiles'] });
      toast({
        title: "Profile Created",
        description: "Successfully created new browser profile",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation cập nhật profile
  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateProfileData }) =>
      ProfileFunctionalService.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/profiles'] });
      toast({
        title: "Profile Updated",
        description: "Profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation xóa profile
  const deleteProfileMutation = useMutation({
    mutationFn: (id: string) => ProfileFunctionalService.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/profiles'] });
      toast({
        title: "Profile Deleted",
        description: "Profile has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation tạo group mới
  const createGroupMutation = useMutation({
    mutationFn: (groupData: CreateGroupData) => ProfileFunctionalService.createGroup(groupData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/profiles/groups'] });
      toast({
        title: "Group Created",
        description: "Successfully created new group",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create group",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation cập nhật group
  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateGroupData }) =>
      ProfileFunctionalService.updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/profiles/groups'] });
      toast({
        title: "Group Updated",
        description: "Group has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update group",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation xóa group
  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => ProfileFunctionalService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/profiles/groups'] });
      toast({
        title: "Group Deleted",
        description: "Group has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete group",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation thêm profiles vào group
  const addProfilesToGroupMutation = useMutation({
    // mutationFn giờ chỉ cần 1 dòng, truyền thẳng payload cho service
    mutationFn: (payload: AddToGroupPayload) =>
      ProfileFunctionalService.addProfilesToGroup(payload),

    onSuccess: () => {
      // Invalidate cả profiles và groups để UI cập nhật
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/profiles/groups'] });
      toast({
        title: "Added to Group",
        description: "Profiles have been successfully added to the group.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Operation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation xóa profiles khỏi group
  const removeProfilesFromGroupMutation = useMutation({
    mutationFn: ({ groupId, profileIds }: { groupId: string, profileIds: string[] }) =>
      ProfileFunctionalService.removeProfilesFromGroup(groupId, profileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/profiles/groups'] });
      toast({
        title: "Removed from Group",
        description: "Profiles have been removed from the group",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove profiles from group",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation khởi chạy profile
  const launchProfileMutation = useMutation({
    mutationFn: (profileId: string) => ProfileFunctionalService.launchProfile(profileId),
    onSuccess: (result) => { /* ... xử lý toast ... */ },
    onError: (error: Error) => { /* ... xử lý toast ... */ }
  });

  // Thêm mutation cho Kịch bản 2
  const launchProfilesMutation = useMutation({
    mutationFn: (params: { profileIds: string[], threads: number }) => ProfileFunctionalService.launchProfiles(params),
    onSuccess: (result) => { toast({ title: "Launch Initiated", description: "Multiple profiles are being launched." }); },
    onError: (error: Error) => { /* ... xử lý toast ... */ }
  });

  // Thêm mutation cho Kịch bản 3
  const launchProfileWithWorkflowMutation = useMutation({
    mutationFn: (params: { profileId: string, workflowId: string }) => ProfileFunctionalService.launchProfileWithWorkflow(params),
    onSuccess: (result) => { toast({ title: "Workflow Launched", description: "Profile has been launched with the selected workflow." }); },
    onError: (error: Error) => { /* ... xử lý toast ... */ }
  });

  // Thêm mutation cho Kịch bản 4
  const launchProfilesWithWorkflowMutation = useMutation({
    mutationFn: (params: { profileIds: string[], workflowId: string, threads: number }) => ProfileFunctionalService.launchProfilesWithWorkflow(params),
    onSuccess: (result) => { toast({ title: "Bulk Workflow Launched", description: "Profiles are being launched with the selected workflow." }); },
    onError: (error: Error) => { /* ... xử lý toast ... */ }
  });

  // Thêm mutation cho Kịch bản 5
  const launchGroupMutation = useMutation({
    mutationFn: (params: { groupId: string, threads: number }) => ProfileFunctionalService.launchGroup(params),
    onSuccess: (result) => { toast({ title: "Group Launched", description: "The selected group is being launched." }); },
    onError: (error: Error) => { /* ... xử lý toast ... */ }
  });

  // Thêm mutation cho Kịch bản 6
  const launchGroupWithWorkflowMutation = useMutation({
    mutationFn: (params: { groupId: string, workflowId: string, threads: number }) => ProfileFunctionalService.launchGroupWithWorkflow(params),
    onSuccess: (result) => { toast({ title: "Group Workflow Launched", description: "The group is being launched with the selected workflow." }); },
    onError: (error: Error) => { /* ... xử lý toast ... */ }
  });

  // Mutation xuất profile
  const exportProfileMutation = useMutation({
    mutationFn: (profileId: string) => ProfileFunctionalService.exportProfile(profileId),
    onSuccess: (blob, profileId) => {
      // Tạo download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-${profileId}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast({
        title: "Profile Exported",
        description: "The profile has been exported successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation nhập profiles
  const importProfilesMutation = useMutation({
    mutationFn: (data: any) => ProfileFunctionalService.importProfiles(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/local/standard/profiles'] });
        toast({
          title: "Profiles Imported",
          description: `Successfully imported ${result.count} profiles`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: "Failed to import profiles",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Return tất cả các giá trị và functions cần thiết
  // Hàm để cập nhật vendorId khi người dùng chọn


  return {
    // Data queries
    profiles,
    basicProfiles,
    groups,
    vendors,
    renderers,
    userAgents,
    hardwareConcurrency,
    deviceMemory,
    resolutions,
    browserLanguages,
    isLoadingProfiles,
    isLoadingGroups,
    isLoadingFingerprint,
    isLoadingProxyGroups: false, // Bổ sung thêm
    profilesError,
    groupsError,
    refetchProfiles,
    refetchGroups,
    getProfileDetails,
    getProfilesInGroup,

    // Mutations
    createProfileAsync: createProfileMutation.mutateAsync,
    createProfile: createProfileMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    deleteProfile: deleteProfileMutation.mutate,
    createGroup: createGroupMutation.mutate,
    updateGroup: updateGroupMutation.mutate,
    deleteGroup: deleteGroupMutation.mutate,
    addProfilesToGroup: addProfilesToGroupMutation.mutate,
    removeProfilesFromGroup: removeProfilesFromGroupMutation.mutate,
    exportProfile: exportProfileMutation.mutate,
    importProfiles: importProfilesMutation.mutate,

    // Launch functions
    launchProfiles: launchProfilesMutation.mutate,
    launchProfile: launchProfileMutation.mutate,
    launchProfileWithWorkflow: launchProfileWithWorkflowMutation.mutate,
    launchProfilesWithWorkflow: launchProfilesWithWorkflowMutation.mutate,
    launchGroup: launchGroupMutation.mutate,
    launchGroupWithWorkflow: launchGroupWithWorkflowMutation.mutate,

    // Mutation states
    isCreatingProfile: createProfileMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isDeletingProfile: deleteProfileMutation.isPending,
    isCreatingGroup: createGroupMutation.isPending,
    isUpdatingGroup: updateGroupMutation.isPending,
    isDeletingGroup: deleteGroupMutation.isPending,
    isAddingProfilesToGroup: addProfilesToGroupMutation.isPending,
    isRemovingProfilesFromGroup: removeProfilesFromGroupMutation.isPending,
    isExportingProfile: exportProfileMutation.isPending,
    isImportingProfiles: importProfilesMutation.isPending,
    // Launch states
    isLaunchingProfile: launchProfileMutation.isPending,
    isLaunchingProfiles: launchProfilesMutation.isPending,
    isLaunchingProfileWithWorkflow: launchProfileWithWorkflowMutation.isPending,
    isLaunchingProfilesWithWorkflow: launchProfilesWithWorkflowMutation.isPending,
    isLaunchingGroup: launchGroupMutation.isPending,
    isLaunchingGroupWithWorkflow: launchGroupWithWorkflowMutation.isPending,
  };
}